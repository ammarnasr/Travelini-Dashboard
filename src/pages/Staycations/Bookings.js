import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Table } from "react-bootstrap";
import firebase from "firebase/app";
import { auth, firestore } from '../../firebase.js';
import { useAuth } from "../../contexts/AuthContext";
import "../../assets/css/Bookings.css";
import Moment from 'moment';



function Bookings() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState(null);
    const [selectedMail, setSelectedMail] = useState("");
    const [selectedPhone, setSelectedPhone] = useState("");
    const [loadingStaycations, setLoadingStaycations] = useState(false);
    const [staycations, setStaycations] = useState(null);
    const { privileges } = useAuth();
    const [updating, setUpdating] = useState({});


    const [show, setShow] = useState(false);
    const showModal = () => setShow(true);
    const closeModal = () => setShow(false);
    const getQuery = useCallback(() => {
        if (privileges === "Owner" || privileges === "Admin") {
            return firestore
                .collection('Staycation Bookings')
                .orderBy("createdAt", "desc");
        } else {
            return firestore
                .collection('Staycation Bookings')
                .where("vendorId", "==", auth.currentUser.uid)
                .orderBy("createdAt", "desc");
        }
    }, [privileges]);

    useEffect(() => {
        let query = getQuery();
        const cancelBookingSub =
            query
                .onSnapshot({
                    next: snapshot => {
                        setBookings(snapshot.docs
                            .sort((a, b) => a.get("createdAt") > b.get("createdAt") ? -1 : 1));
                        setLoading(false);
                    }
                });
        return () => {
            cancelBookingSub();
        };
    }, [getQuery]);

    useEffect(() => {
        async function getStaycations() {
            const chunks = [];
            const chunkSize = 10;
            const ids = bookings.map(booking => booking.get("staycationId")).filter(id => id != null);
            for (let i = 0; i < ids.length; i += chunkSize) {
                chunks.push(ids.slice(i, i + chunkSize))
            }
            const chunkResults = await Promise.all(
                chunks.map(ids => firestore.collection("Staycations").where(
                    firebase.firestore.FieldPath.documentId(),
                    'in',
                    ids
                ).get())
            );
            const results = chunkResults.flatMap(result => result.docs);
            const staycations = new Map();
            for (const doc of results) {
                staycations.set(doc.ref.id, doc);
            }
            setStaycations(staycations)
        }
        if (bookings) {
            console.log('loading bookings')
            setLoadingStaycations(true);
            getStaycations().finally(() => setLoadingStaycations(false));
        }
    }, [bookings]);

    const onMail = doc => async () => {
        setSelectedMail(doc.get("email"));
        setSelectedPhone(doc.get("phone_number"));
        showModal();
    };

    function EmailModal({ show, onCancel, userMail, userPhone }) {
        const [email, setEmail] = useState();
        const [subject, setSubject] = useState();
        const [body, setBody] = useState();
        const [error, setError] = useState();

        const handleEmailChange = e => { setEmail(e.target.value); };
        const handleSubjectChange = e => { setSubject(e.target.value); };
        const handleBodyChange = e => { setBody(e.target.value); };


        const resetState = () => {
            setError(undefined);
        };
        const handleCancel = async () => {
            await onCancel();
            resetState();
        }
        const handleSave = async () => {
            if (!email?.trim()) {
                setError("The email is required");
            }
            else if (!subject?.trim()) {
                setError("The subject is required");
            }
            else if (!body?.trim()) {
                setError("The body is required");
            }
            else {
                setError(null);
                //await onSave({ email, image });
                resetState();
            }
        };
        const Mailto = ({ email, subject = '', body = '', children }) => {
            let params = subject || body ? '?' : '';
            if (subject) params += `subject=${encodeURIComponent(subject)}`;
            if (body) params += `${subject ? '&' : ''}body=${encodeURIComponent(body)}`;

            return <a href={`mailto:${email}${params}`}>{children}</a>;
        };
        return (
            <Modal show={!!show} onHide={onCancel}>
                <Modal.Header closeButton>Send Email To User</Modal.Header>
                <Modal.Body>
                    <div >
                        {userMail}
                        <div style={{ marginTop: 20 }}>
                            {userPhone}
                            <div style={{ marginTop: 20 }}></div>
                        </div>
                        <Form.Control type="text"
                            placeholder="Enter the subject"
                            valid={!error}
                            onChange={handleSubjectChange}
                        />
                        <div style={{ marginTop: 20 }}>

                        </div>
                        <Form.Control type="text"
                            placeholder="Enter the body"
                            valid={!error}
                            onChange={handleBodyChange}
                            as="textarea"

                        />
                    </div>
                    {error
                        ? <Alert variant="danger" style={{ marginTop: 16 }}>{error}</Alert>
                        : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="link" onClick={handleCancel}>Cancel</Button>
                    <Mailto email={userMail} subject={subject} body={body}>
                        Send
                    </Mailto>
                </Modal.Footer>
            </Modal>
        );
    }

    EmailModal.defaultProps = {
        show: false,
        onSave: () => { },
        onCancel: () => { },
    };

    const toggleConfirmed = doc => async () => {
        setUpdating(updating => ({
            ...updating,
            [doc.ref.id]: true
        }));
        await doc.ref.set({ confirmed: !doc.get("confirmed") }, { merge: true })
        setUpdating(updating => ({
            ...updating,
            [doc.ref.id]: false
        }));
    }


    return (
        <>
            <EmailModal show={show} onCancel={closeModal} userMail={selectedMail} userPhone={selectedPhone} />

            <div className="container CardContainer">
                <div className="d-flex align-items-center">
                    <h2 className="CardContainer-title flex-grow-1">Bookings</h2>
                </div>
                <div className="CardContainer-body">
                    <Table responsive borderless className="CardContainer-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Staycation</th>
                                <th>Adults</th>
                                <th>Children</th>
                                <th>Rooms</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Created At</th>
                                <th>Confirmed</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading || loadingStaycations
                                ? <tr><td colSpan={5}>LOADING...</td></tr>
                                : !bookings?.length
                                    ? <tr><td colSpan={5}>There are no bookings at this time</td></tr>
                                    : <>
                                        {bookings.map(doc => (
                                            <>
                                                <tr key={doc.id}>
                                                    <td>{doc.get("last_name")}, {doc.get("first_name")}</td>
                                                    <td>{staycations.get(doc.get("staycationId"))?.get("title") ?? "N/A"}</td>
                                                    <td>{doc.get("adultCnt")}</td>
                                                    <td>{doc.get("childCnt")}</td>
                                                    <td>{doc.get("roomCnt")}</td>
                                                    <td>{doc.get("checkInDate")}</td>
                                                    <td>{doc.get("checkOutDate")}</td>
                                                    <td>{Moment(doc.get("createdAt")?.toDate()).format("DD MMM hh:mm").toString()}</td>
                                                    <td>
                                                        <Form.Check
                                                            disabled={updating[doc.ref.id]}
                                                            type="checkbox"
                                                            label={doc.get("confirmed") ? "Yes" : "No"}
                                                            onChange={toggleConfirmed(doc)}
                                                            checked={!!doc.get("confirmed")} />
                                                    </td>
                                                    <td className="Offers-actions">
                                                        <button onClick={onMail(doc)}
                                                            className="btn Offers-edit">Send Email</button>
                                                    </td>
                                                </tr>
                                                {!!doc.get("comments")
                                                    ? <tr key={`${doc.id}-comment`}>
                                                        <td></td>
                                                        <td colSpan={8} className="Bookings-comments">
                                                            Comments: {doc.get("comments")}
                                                        </td>
                                                    </tr>
                                                    : null
                                                }
                                            </>
                                        ))}
                                    </>}
                        </tbody>
                    </Table>
                </div>
            </div>
        </>
    );
}

export default Bookings;
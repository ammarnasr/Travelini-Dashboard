import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Table } from "react-bootstrap";
import firebase from "firebase/app";
import { auth, firestore } from '../../firebase.js';
import { useAuth } from "../../contexts/AuthContext";
import "../../assets/css/Bookings.css";
import axios from "axios";



function Bookings() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState(null);
    const [bookings2, setBookings2] = useState({ data: [] });
    const [selectedMail, setSelectedMail] = useState("");
    const [selectedPhone, setSelectedPhone] = useState("");
    const [loadingStaycations, setLoadingStaycations] = useState(false);
    const [staycations, setStaycations] = useState(null);
    const { privileges } = useAuth();
    const [updating, setUpdating] = useState({});
    const [updating2, setUpdating2] = useState(false);

    
  const getBookings = () => {
    console.log("Getting bookings...")
    axios
      .get("http://localhost:80/staycations/getAllStaycationBooking")
      .then((data) => {
        setBookings2(data.data);
        setUpdating2(false);
      })
      .catch((error) => console.log(error));
  };

  
  const onToggleConfirmed = async (doc) => {
    console.log("Confirmed Document: " , doc)
    toggleConfirmedFromPG(doc.id);
  };


  
  const toggleConfirmedFromPG = (id) => {
    setUpdating2(true);

    let urlToggle = "http://localhost:80/staycations/toggleConfirmed/" + id;
    console.log("URL to toggle Confirmed: ", urlToggle);
    axios
      .get(urlToggle)
      .then((data) => {
        console.log(data.data);
        getBookings();
      })
      .catch((error) => {
          console.log(error);
          setUpdating2(false);
        })

  };
  
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
        getBookings()
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

    // useEffect(() => {
    //     async function getStaycations() {
    //         const chunks = [];
    //         const chunkSize = 10;
    //         const ids = bookings.map(booking => booking.get("staycationId")).filter(id => id != null);
    //         for (let i = 0; i < ids.length; i += chunkSize) {
    //             chunks.push(ids.slice(i, i + chunkSize))
    //         }
    //         const chunkResults = await Promise.all(
    //             chunks.map(ids => firestore.collection("Staycations").where(
    //                 firebase.firestore.FieldPath.documentId(),
    //                 'in',
    //                 ids
    //             ).get())
    //         );
    //         const results = chunkResults.flatMap(result => result.docs);
    //         const staycations = new Map();
    //         for (const doc of results) {
    //             staycations.set(doc.ref.id, doc);
    //         }
    //         setStaycations(staycations)
    //     }
    //     if (bookings) {
    //         // console.log('loading bookings')
    //         setLoadingStaycations(true);
    //         getStaycations().finally(() => setLoadingStaycations(false));
    //     }
    // }, [bookings]);

    const onMail = doc => async () => {
        setSelectedMail(doc.email);
        setSelectedPhone(doc.phone_number);
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
                                : !bookings2.data?.length
                                    ? <tr><td colSpan={5}>There are no bookings at this time</td></tr>
                                    : <>
                                        {bookings2.data.map(doc => (
                                            <>
                                                <tr key={doc.id}>
                                                    <td>{doc.last_name}, {doc.first_name}</td>
                                                    <td>{doc.staycationTitle}</td>
                                                    <td>{doc.adultCnt}</td>
                                                    <td>{doc.childCnt}</td>
                                                    <td>{doc.roomCnt}</td>
                                                    <td>{doc.checkInDate}</td>
                                                    <td>{doc.checkOutDate}</td>
                                                    <td>{doc.createdAt}</td>
                                                    <td>
                                                        <Form.Check
                                                            disabled={updating2}
                                                            type="checkbox"
                                                            label={doc.confirmed ? "Yes" : "No"}
                                                            onChange={() => {
                                                                onToggleConfirmed(doc);
                                                                }}
                                                            checked={doc.confirmed} />
                                                    </td>
                                                    <td className="Offers-actions">
                                                        <button onClick={onMail(doc)}
                                                            className="btn Offers-edit">Send Email</button>
                                                    </td>
                                                </tr>
                                                {!!doc.comments
                                                    ? <tr key={`${doc.id}-comment`}>
                                                        <td></td>
                                                        <td colSpan={8} className="Bookings-comments">
                                                            Comments: {doc.comments}
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
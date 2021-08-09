import React, { useCallback, useEffect, useState } from 'react';
import { Button, Table, Form } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useHistory } from "react-router-dom";
import '../../assets/css/Offers.css';
import { auth, firestore } from '../../firebase.js';
import { useAuth } from "../../contexts/AuthContext";


function Offers() {
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState({});
    const [staycations, setStaycations] = useState(null);
    const history = useHistory();
    const { uploadAdminData, privileges } = useAuth();
    const onDelete = doc => async () => {
        setLoading(true);
        try {
            await doc.ref.delete();
        } finally {
            setLoading(false);
        }
    };
    const onEdit = doc => async () => {
        history.push({
            pathname: "/admin/staycations/edit",
            state: { ...doc.data(), id: doc.id },
        });
    };

    const togglePublished = doc => async () => {
        setUpdating(updating => ({
            ...updating,
            [doc.ref.id]: true
        }));
        await doc.ref.set({ published: !doc.get("published") }, { merge: true })
        setUpdating(updating => ({
            ...updating,
            [doc.ref.id]: false
        }));
    }

    const getQuery = useCallback(() => {
        if (privileges === "Owner" || privileges === "Admin") {
            return firestore
                .collection('Staycations');
        } else {
            return firestore
                .collection('Staycations')
                .where("vendorId", "==", auth.currentUser.uid).orderBy("createdAt", "desc");
        }
    }, [privileges])

    useEffect(() => {
        setLoading(true);
        const query = getQuery()
        const cancelSub = query
            .onSnapshot({
                next: snapshot => {
                    setStaycations(snapshot.docs
                        .sort((a, b) => a.get("createdAt") > b.get("createdAt") ? -1 : 1));
                    uploadAdminData(auth.currentUser.displayName, auth.currentUser.email, snapshot.docs.length, new Date());
                    setLoading(false);
                }
            });
        return () => cancelSub();
    }, [getQuery, uploadAdminData]);
    return (
        <div className="container CardContainer">
            <div className="d-flex align-items-center">
                <h2 className="CardContainer-title flex-grow-1">Offers</h2>
                {privileges === "None" ?
                    <></> :
                    <LinkContainer to="staycations/add">
                        <Button variant="primary" className="CardContainer-action">Add</Button>
                    </LinkContainer>}
            </div>
            <div className="CardContainer-body">
                <Table responsive borderless className="CardContainer-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Price</th>
                            <th>Availability</th>
                            <th>Published</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? <tr><td colSpan={6}>LOADING...</td></tr>
                            : !staycations?.length
                                ? <tr><td colSpan={6}>{privileges === "None" ? "You don't have sufficient privileges to view this page" : "There Are No Staycations"}</td></tr>
                                : <>
                                    {staycations.map(doc => (
                                        <tr key={doc.id}>
                                            <td>{doc.get("title")}</td>
                                            <td>{doc.get("category")}</td>
                                            <td>{doc.get("location")}</td>
                                            <td>{doc.get("currency")}<br />{doc.get("price")}</td>
                                            <td>{doc.get("offerStart")}<br />{doc.get("offerEnd")}</td>
                                            <td>
                                                <Form.Check
                                                    disabled={updating[doc.ref.id]}
                                                    type="checkbox"
                                                    label={doc.get("published") ? "Yes" : "No"}
                                                    onChange={togglePublished(doc)}
                                                    checked={!!doc.get("published")} />
                                            </td>
                                            <td className="Offers-actions">
                                                <button onClick={onEdit(doc)}
                                                    className="btn Offers-edit">Edit</button>
                                                <button onClick={onDelete(doc)}
                                                    className="btn Offers-delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </>}
                    </tbody>
                </Table>
            </div>
        </div >
    );
}

export default Offers;
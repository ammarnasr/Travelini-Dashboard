import React, { useEffect, useState } from 'react';
import { Form, Table, DropdownButton, Dropdown } from "react-bootstrap";
import { auth, firestore } from '../firebase.js';
import Moment from 'moment';
import { useAuth } from "../contexts/AuthContext";

function Admins() {
    const [updating, setUpdating] = useState(true);
    const [loading, setLoading] = useState(true);
    const [admins, setAdmins] = useState(null);
    const { privileges } = useAuth()


    const allPrivileges = ["Admin", "Editor", "None"]

    useEffect(() => {
        if (privileges === "Editor" || privileges === "None") {
            setAdmins([]);
            setLoading(false);
            return;
        }
        const cancelAdminSub = firestore
            .collection('Admins')
            .onSnapshot({
                next: snapshot => {
                    setAdmins(snapshot.docs);
                    setLoading(false);
                }
            });
        return () => {
            cancelAdminSub();
        };
    }, [privileges]);

    const togglePrivileges = async (e, doc) => {
        setUpdating(updating => ({
            ...updating,
            [doc.ref.id]: true
        }));
        await doc.ref.set({ privileges: e }, { merge: true })
        setUpdating(updating => ({
            ...updating,
            [doc.ref.id]: false
        }));
    }

    return (
        <>

            <div className="container CardContainer">
                <div className="d-flex align-items-center">
                    <h2 className="CardContainer-title flex-grow-1">Admins</h2>
                </div>
                <div className="CardContainer-body">
                    <Table responsive borderless className="CardContainer-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Staycation Count</th>
                                <th>Last Login</th>
                                <th>Created At</th>
                                <th>Privileges</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? <tr><td colSpan={5}>LOADING...</td></tr>
                                : !admins?.length || privileges === "None" || privileges === "Editor"
                                    ? <tr><td colSpan={5}>{privileges === "None" || privileges === "Editor" ? "You don't have sufficient privileges to view this page" : "There are no admins at this time"}</td></tr>
                                    : <>
                                        {admins.map(doc => (
                                            <tr key={doc.id}>
                                                <td>{doc.get("name")}</td>
                                                <td>{doc.get("email")}</td>
                                                <td>{doc.get("privileges") === "Admin" ? "-" : doc.get("staycationCount")}</td>
                                                <td>{Moment(doc.get("lastLogin")?.toDate()).format("DD MMM hh:mm").toString()}</td>
                                                <td>{Moment(doc.get("createdAt")?.toDate()).format("DD/MM/yy").toString()}</td>
                                                <td>
                                                    {doc.ref.id === auth.currentUser.uid || doc.get("privileges") === "Owner" ? <>{doc.get("privileges")}</> :
                                                        <Form.Group id="category">
                                                            <DropdownButton
                                                                id="dropdown-category"
                                                                title={doc.get("privileges")}
                                                                variant="light"
                                                                disabled={updating[doc.ref.id]}
                                                                onSelect={(e) => togglePrivileges(e, doc)}
                                                            >
                                                                {
                                                                    allPrivileges.map((category) =>
                                                                        <Dropdown.Item key={category} eventKey={category}>{category}</Dropdown.Item>
                                                                    )
                                                                }
                                                            </DropdownButton>
                                                        </Form.Group>}
                                                </td>
                                            </tr>
                                        ))}
                                    </>}
                        </tbody>
                    </Table>
                </div>
            </div>
        </>
    );
}

export default Admins;
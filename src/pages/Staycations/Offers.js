import React, { useCallback, useEffect, useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useHistory } from "react-router-dom";
import "../../assets/css/Offers.css";
import { auth, firestore } from "../../firebase.js";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

function Offers() {
  const [loading, setLoading] = useState(false);
  const [updating2, setUpdating2] = useState(false);
  const [staycations2, setStaycations2] = useState({ data: [] });
  const history = useHistory();
  const { uploadAdminData, privileges } = useAuth();

  const onDelete = (doc) => async () => {
    deleteOfferFromPG(doc.id);
  };

  const onEdit = (doc) => async () => {
    history.push({
      pathname: "/admin/staycations/edit",
      state: { ...doc, id: doc.id },
    });
  };

  const onTogglePublished = async (doc) => {
    togglePublishedFromPG(doc.id);
  };

  const getOffers = () => {
    axios
      .get("https://www.travelini.link/staycations/0/getOffers")
      .then((data) => {
        setStaycations2(data.data);
        console.log(data.data);
        setUpdating2(false);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const togglePublishedFromPG = (id) => {
    setUpdating2(true);

    let urlToggle = "https://www.travelini.link/staycations/togglePublished/" + id;
    axios
      .get(urlToggle)
      .then((data) => {
        console.log(data.data);
        getOffers();
      })
      .catch((error) => console.log(error));
  };

  const deleteOfferFromPG = (id) => {
    console.log("Deleting Data");
    setLoading(true);

    let urlToggle = "https://www.travelini.link/staycations/deleteOffer/" + id;
    axios
      .get(urlToggle)
      .then((data) => {
        console.log(data.data);
        getOffers();
      })
      .catch((error) => console.log(error));
  };

  const getQuery = useCallback(() => {
    if (privileges === "Owner" || privileges === "Admin") {
      return firestore.collection("Staycations");   
    } else {
      return firestore
        .collection("Staycations")
        .where("vendorId", "==", auth.currentUser.uid)
        .orderBy("createdAt", "desc");
    }
  }, [privileges]);

  useEffect(() => {
    setLoading(true);
    getOffers();

    const cancelSub = () => {
      setLoading(false);
    };
    return () => cancelSub();
  }, [getQuery, uploadAdminData]);

  return (
    <div className="container CardContainer">
      <div className="d-flex align-items-center">
        <h2 className="CardContainer-title flex-grow-1">Offers</h2>
        {privileges === "None" ? (
          <></>
        ) : (
          <LinkContainer to="staycations/add">
            <Button variant="primary" className="CardContainer-action">
              Add
            </Button>
          </LinkContainer>
        )}
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
            {loading ? (
              <tr>
                <td colSpan={6}>LOADING...</td>
              </tr>
            ) : !staycations2.data?.length ? (
              <tr>
                <td colSpan={6}>
                  {privileges === "None"
                    ? "You don't have sufficient privileges to view this page"
                    : "There Are No Staycations"}
                </td>
              </tr>
            ) : (
              <>
                {staycations2.data.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.title}</td>
                    <td>{doc.category}</td>
                    <td>{doc.location}</td>
                    <td>
                      {doc.currency}
                      <br />
                      {doc.price}
                    </td>
                    <td>
                      {doc.offerstart}
                      <br />
                      {doc.offerend}
                    </td>
                    <td>
                      <Form.Check
                        disabled={updating2}
                        type="checkbox"
                        label={doc.published ? "Yes" : "No"}
                        onChange={() => {
                          onTogglePublished(doc);
                        }}
                        checked={doc.published}
                      />
                    </td>
                    <td className="Offers-actions">
                      <button onClick={onEdit(doc)} className="btn Offers-edit">
                        Edit
                      </button>
                      <button
                        onClick={onDelete(doc)}
                        className="btn Offers-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default Offers;

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { ImagePicker } from "react-file-picker";
import { FaTrash } from "react-icons/fa"
import "../assets/css/StaycationCategories.css";
import imageIcon from "../assets/images/image-icon.svg";
import { firestore, storage } from "../firebase.js";
import { useAuth } from "../contexts/AuthContext";



function Category({ doc, onDelete }) {
    const { cover_image_url, name } = doc.data();
    const [deleteShown, setDeleteShown] = useState(false);
    const showDelete = () => setDeleteShown(true);
    const hideDelete = () => setDeleteShown(false);

    return (
        <div className="Category"
            onMouseEnter={showDelete}
            onMouseLeave={hideDelete}>
            <img src={cover_image_url} alt={`${name}'s cover`} />
            <span className="Category-title">{name}</span>
            <button className="Category-delete" onClick={onDelete} style={{
                visibility: deleteShown ? 'visible' : 'hidden'
            }}><FaTrash /></button>
        </div>
    );
}

Category.defaultProps = {
    onDelete: () => { },
};

Category.propTypes = {
    doc: PropTypes.any.isRequired,
    onDelete: PropTypes.func.isRequired,
};

function CategoryModal({ show, onSave, onCancel }) {
    const [image, setImage] = useState();
    const [name, setName] = useState("");
    const [error, setError] = useState();
    const [saveDisabled, setSaveDisabled] = useState(false);
    const handleNameChange = e => { setName(e.target.value); };
    const handleImageChange = image => setImage(image);
    const resetState = () => {
        setImage(undefined);
        setError(undefined);
        setSaveDisabled(false);
    };
    const handleCancel = async () => {
        await onCancel();
        resetState();
    }
    const handleSave = async () => {
        setSaveDisabled(true);
        if (!image) {
            setError("The cover image is required");
            setSaveDisabled(false);
        } else if (name.trim().length < 1) {
            setError("The name is required");
            setSaveDisabled(false);
        } else {
            setError(null);
            await onSave({ name, image });
            resetState();
        }
    };
    return (
        <Modal show={!!show} onHide={onCancel}>
            <Modal.Header closeButton>New Saycation Category</Modal.Header>
            <Modal.Body>
                <div className="NewCategory">
                    <ImagePicker
                        extensions={['jpg', 'jpeg', 'png']}
                        dims={{ minWidth: 0, maxWidth: 99999, minHeight: 0, maxHeight: 99999 }}
                        onChange={handleImageChange}
                    >
                        <button>
                            <img src={image ?? imageIcon} alt="cover of the new category" />
                        </button>
                    </ImagePicker>
                    <Form.Control type="text"
                        placeholder="Enter the category's name"
                        valid={!error}
                        onChange={handleNameChange}
                    />
                </div>
                {error
                    ? <Alert variant="danger" style={{ marginTop: 16 }}>{error}</Alert>
                    : null}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={saveDisabled}>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

CategoryModal.defaultProps = {
    show: false,
    onSave: () => { },
    onCancel: () => { },
};

CategoryModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

function StaycationCategories() {
    const { privileges } = useAuth()

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState();
    const [show, setShow] = useState(false);
    const showModal = () => setShow(true);
    const closeModal = () => setShow(false);

    const deleteCategory = doc => async () => {
        setLoading(true);
        try {
            await doc.ref.delete();
        } finally {
            setLoading(false);
        }
    };
    const createCategory = async ({ name, image }) => {
        const { ref } = await storage
            .ref(`/StaycationCategories/${name}`)
            .child('cover')
            .putString(image, 'data_url');
        const cover_image_url = await ref.getDownloadURL();
        await firestore.collection('StaycationCategories/').add({
            name,
            cover_image_url
        });
        closeModal();
    };
    useEffect(() => {
        setLoading(true);
        if (privileges === "Editor" || privileges === "None") {
            setCategories([]);
            setLoading(false);
            return;
        }
        const cancelSub = firestore
            .collection('StaycationCategories')
            .onSnapshot({
                next(snapshot) {
                    setCategories(snapshot.docs);
                    setLoading(false);
                }
            });
        return cancelSub;
    }, [privileges]);
    return (
        <>
            <CategoryModal show={show} onSave={createCategory} onCancel={closeModal} />
            <div className="container CardContainer">
                <div className="d-flex align-items-center">
                    <h2 className="CardContainer-title flex-grow-1">Staycation Categories</h2>
                    {privileges === "None" || privileges === "Editor" ? <></> : <Button variant="primary" className="CardContainer-action" onClick={showModal}>Add</Button>}
                </div>
                <div className="CardContainer-body">
                    {loading
                        ? "Loading"
                        : !categories?.length || privileges === "None" || privileges === "Editor"
                            ? (privileges === "None" || privileges === "Editor" ? "You don't have sufficient privileges to view this page" : "There are no categories here.")
                            : <div className="CategoryList">
                                {categories.map(doc => <Category key={doc.id} doc={doc} onDelete={deleteCategory(doc)} />)}
                            </div>
                    }
                </div>
            </div>
        </>
    );
}
export default StaycationCategories;
import React, { useEffect, useState } from "react";
import { Alert, Button, DropdownButton, Form } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, useHistory, useLocation } from "react-router-dom";
import "../assets/css/CreateStaycation.css";
import ImageAddButton from "../components/ImageAddButton.js";
import ImageAdded from "../components/ImageAdded.js";
import { auth, firestore, storage } from "../firebase.js";
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import PropTypes from "prop-types";
import axios from "axios";

const MAX_IMAGE_COUNT = 12;

const Currency_List = ["AED", "USD", "EUR", "GBP", "SAR"];

export function CreateStaycation({ edit }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const [currency, setCurrency] = useState(    edit ? location.state.currency : "AED"  );
  const [category, setCategory] = useState(edit ? location.state.category : "Ras Al Khaimah");
  const [images, setImages] = useState(edit ? location.state.image_urls : []);
  const [availableDates, setAvailableDates] = useState(edit ? [location.state.offerStart, location.state.offerEnd] : []);
  const [allCategories, setAllCategories] = useState({ data: [] });
  const [staycation, setStaycation] = useState(
    edit
      ? location.state
      : {
          title: "",
          location: "",
          priceAmount: 0,
          price: "",
          category: "",
          currency: "",
          description: "",
          included: "",
          excluded: "",
          addons: "",
          terms: "",
        }
  );


  const handleFieldChange = ({ target: { name, value } }) => {
    setStaycation((staycation) => ({
      ...staycation,
      [name]: value,
    }));
  };
  const handleDates = (dateRange) => {
    setAvailableDates(
      dateRange.map((date) => {
        return `${date.year}-${date.month < 10 ? 0 : ""}${date.month}-${
          date.day < 10 ? 0 : ""
        }${date.day}`;
      })
    );
  };
  const handleSubmit = async (e) => {
    let imageUrls = [];
    console.log('Images are available:', images)
    images.forEach((img, index) => {
      console.log(index + " " + img.length);
      if (img.length < 1000) {
        imageUrls = [...imageUrls, img];
        if (imageUrls.length === images.length) {
          finishUpload(imageUrls);
        }
      }
    });
    console.log('Image Urls:', imageUrls)
    const newOffer = {
      Addons: staycation.addons,
      Category: category,
      Cover_image_url: imageUrls[0],
      Currency: currency,
      Description: staycation.description,
      Duration: "24 H",
      Excluded: staycation.excluded,
      Image_urls: imageUrls.toString(),
      Included: staycation.included,
      Location: staycation.location,
      OfferEnd: availableDates[1],
      OfferStart: availableDates[0],
      Price: staycation.price,
      Published: false,
      RoomType: staycation.roomType,
      Terms: staycation.terms,
      Title: staycation.title,
      VendorId: auth.currentUser.uid,
    };

    console.log("Pressed Submit with Data", newOffer);
    postStaycation(newOffer);

    e.preventDefault();
    setLoading(true);
    
    console.log("Upload Done");
  };


  const onPickImg = (img) => {
    setImages([...images, img]);
  };
  const onDeleteImg = (img) => {
    setImages(images.filter((im) => im !== img));
  };

  const postStaycation = (newOffer) => {
    axios
      .post("https://www.travelini.link/api/v1/staycation", newOffer)
      .then((data) =>{
        console.log(data.data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }; 
  const getCategories = () => {
    console.log("Getting Categories...")
    axios
      .get("https://www.travelini.link/staycations/getCategory")
      .then((data) => {
        // console.log(data.data.data[0].name);
        setAllCategories(data.data);
        setLoading(false);
        console.log("The Cats: ", allCategories)  

      })
      .catch((error) => console.log(error));
  };


  const finishUpload = async (imageUrls) => {
    console.log('finishUpload Image Urls: ', imageUrls);
    const data = {
      ...staycation,
      cover_image_url: imageUrls[0],
      image_urls: imageUrls,
      duration: "24 H",
      offerStart: availableDates[0],
      offerEnd: availableDates[1],
      category: category,
      vendorId: auth.currentUser.uid,
    };

    try {
      const collection = firestore.collection("Staycations");
      if (edit) {
        await collection.doc(location.state.id).set(data);
      } else {
        await collection.add(data);
      }
      history.push("/admin/staycations/");
    } catch (e) {
      setError("Failed to upload staycation");
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getCategories();
    const cancelSub = firestore.collection("StaycationCategories").onSnapshot({
    //   next: (snapshot) => {
    //     setAllCategories(snapshot.docs.map((item) => item.get("name")));
    //   },
    });
    console.log("The Cats: ", allCategories)
    return () => cancelSub();
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="create-inner">
        <h2 className="text-center mb-4">
          {category == "Tickets" ? "Buy Tickets" : "Create Staycation"}
        </h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group id="images">
            <Form.Label>Images</Form.Label>
            <div style={{ height: "10px" }}></div>

            <div className="grid-container">
              {Array.from(images).map((img, idx) => (
                <ImageAdded key={idx} image={img} onDelete={onDeleteImg} />
              ))}
              {images.length < MAX_IMAGE_COUNT && (
                <ImageAddButton onPick={onPickImg} />
              )}
            </div>
          </Form.Group>
          <div style={{ height: "10px" }}></div>

          <Form.Group id="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              name="title"
              onChange={handleFieldChange}
              value={staycation.title ?? ""}
              placeholder="Enter staycation title"
              required
            />
          </Form.Group>

          <Form.Group id="category">
            <Form.Label>Category</Form.Label>
            <DropdownButton
              id="dropdown-category"
              title={category}
              variant="dark"
              onSelect={(e) => setCategory(e)}
              value={staycation.category}
            >
              {allCategories.data.map((category) => (
                <Dropdown.Item key={category.name} eventKey={category.name}>
                  {category.name}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </Form.Group>

          <Form.Group id="location">
            <Form.Label>Location</Form.Label>
            <Form.Control
              name="location"
              onChange={handleFieldChange}
              value={staycation.location ?? ""}
              placeholder="Enter the location"
              required
            />
          </Form.Group>

          <Form.Group id="roomType">
            <Form.Label>
              {category == "Tickets" ? "Tickets" : "Room Type"}
            </Form.Label>
            {/* <Form.Label>{category}</Form.Label> */}
            <Form.Control
              name="roomType"
              onChange={handleFieldChange}
              value={staycation.roomType ?? ""}
              placeholder={
                category == "Tickets"
                  ? "Enter The Ticket Type"
                  : "Enter the room type"
              }
              required
            />
          </Form.Group>

          {/* <Form.Group id="currency">
            <Form.Label>Currency</Form.Label>
            <Form.Control
              name="currency"
              onChange={handleFieldChange}
              value={staycation.currency ?? ""}
              placeholder="Enter the currency code (e.g. USD, AED, etc.)"
              required
            />
          </Form.Group> */}

          <Form.Group id="currency">
            <Form.Label>Currency</Form.Label>
            <DropdownButton
              id="dropdown-currency"
              title={currency}
              variant="dark"
              onSelect={(e) => setCurrency(e)}
              value={staycation.currency}
            >
              {Currency_List.map((currency) => (
                <Dropdown.Item key={currency} eventKey={currency}>
                  {currency}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </Form.Group>

          <Form.Group id="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              name="price"
              onChange={handleFieldChange}
              value={staycation.price ?? ""}
              placeholder="Enter the price per night"
              required
            />
          </Form.Group>
          {/* 
          <Form.Group id="priceAmount">
            <Form.Label>Price Amount</Form.Label>
            <Form.Control
              type="number"
              name="priceAmount"
              onChange={handleFieldChange}
              value={staycation.priceAmount ?? ""}
              placeholder="Enter the Amount"
              required
            />
          </Form.Group> */}

          <div style={{ height: "50px" }} />
          <Form.Group id="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              name="description"
              onChange={handleFieldChange}
              value={staycation.description ?? ""}
              placeholder="Enter general description"
              required
              as="textarea"
            />
          </Form.Group>
          <Form.Group id="availability">
            <Form.Label>Available Dates</Form.Label>
            <br></br>
            <DatePicker
              value={availableDates}
              onChange={handleDates}
              range
              plugins={[<DatePanel />]}
            />
          </Form.Group>

          <div style={{ height: "50px" }} />

          <Form.Group id="included">
            <Form.Label>Included</Form.Label>
            <Form.Control
              name="included"
              onChange={handleFieldChange}
              value={staycation.included ?? ""}
              placeholder="Enter info on what's included"
              as="textarea"
            />
          </Form.Group>

          <Form.Group id="exclusions">
            <Form.Label>Excluded</Form.Label>
            <Form.Control
              name="excluded"
              onChange={handleFieldChange}
              value={staycation.excluded ?? ""}
              placeholder="Enter info on what's excluded"
              as="textarea"
            />
          </Form.Group>

          <Form.Group id="addons">
            <Form.Label>Addons</Form.Label>
            <Form.Control
              name="addons"
              onChange={handleFieldChange}
              value={staycation.addons ?? ""}
              placeholder="Enter info on additions"
              as="textarea"
            />
          </Form.Group>

          <Form.Group id="terms">
            <Form.Label>Terms and conditions</Form.Label>
            <Form.Control
              name="terms"
              onChange={handleFieldChange}
              value={staycation.terms ?? ""}
              placeholder="Enter terms and conditions"
              as="textarea"
            />
          </Form.Group>

          <div style={{ height: "40px" }}></div>
          <Button disabled={loading} className="w-100" type="submit">
            Submit
          </Button>
        </Form>
        <div style={{ height: "30px" }}></div>
        <div className="w-100 text-center mt-2">
          <Link to="/admin/staycations/">Cancel</Link>
        </div>
      </div>

      <div style={{ height: "1px" }}></div>
    </div>
  );
}

CreateStaycation.defaultProps = {
  edit: false,
};

CreateStaycation.propTypes = {
  edit: PropTypes.bool.isRequired,
};

export function EditStaycation() {
  return <CreateStaycation edit />;
}

export default CreateStaycation;

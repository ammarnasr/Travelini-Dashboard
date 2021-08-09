import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

export default function ImageAdded({ image, onDelete }) {
  const [isHovering, setHovering] = useState(false);
  function handleMouseHover() {
    setHovering(!isHovering);
  }

  function deleteImage(img){
    onDelete(image);
  }

  return (
    <div
      style={{ display: "inline" }}
      onMouseEnter={handleMouseHover}
      onMouseLeave={handleMouseHover}
    >
      <img className="img-preview" src={image} alt="Loading.." />

      {isHovering && <Button className="remove-img-button" variant="danger" onClick={()=>deleteImage(image)}>
        <FaTrash />
      </Button>}
    </div>
  );
}

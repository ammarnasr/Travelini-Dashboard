import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { ImagePicker } from "react-file-picker";

import React from "react";
export default function ImageAddButton({onPick}) {
  return (
    <ImagePicker style={{display:"inline"}}
      extensions={["jpg", "jpeg", "png"]}
      dims={{
        minWidth: 0,
        maxWidth: 99999,
        minHeight: 0,
        maxHeight: 99999,
      }}
      onChange={onPick}
    >
      <Button className="img-preview" variant="light">
          <FaPlus/>
      </Button>
    </ImagePicker>
  );
}

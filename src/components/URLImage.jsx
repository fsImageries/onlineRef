import React, { useRef, useEffect, useState, useReducer } from "react";
import { Image, RegularPolygon } from "react-konva";


const URLImage = ({ imageProps, onChange, idx }) => {
  const imageRef = useRef();


  const transformHandler = (e) => {
    // transformer is changing scale of the node
    // and NOT its width or height
    // but in the store we have only width and height
    // to match the data better we will reset scale on transform end
    const node = imageRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // we will reset it back
    node.scaleX(1);
    node.scaleY(1);
    // console.log("In transform: ", node.x())
    onChange({
      ...imageProps,
      src: imageProps.src,
      x: node.x(),
      y: node.y(),
      // set minimal value
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(node.height() * scaleY),
    });
  };

  return (
    <>
      <Image
        {...imageProps}
        draggable
        name={"image"}
        ref={imageRef}
        onMouseOver={() => {
          if (imageProps.type === "vid") {
            setPlaying({type:"play"})
          }
        }}
        onMouseLeave={() => {
          if (imageProps.type === "vid") {
            setPlaying({type:"pause"})
          }
        }}
        // Needed for selection and transformation of the image
        // just disable video buttons while dragging, idiot
        onDragMove={(e) => {
          onChange({
            ...imageProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) => {
          onChange({
            ...imageProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        // onTransform={transformHandler}
        onTransformEnd={transformHandler}
      ></Image>
    </>
  );
};

export default URLImage;

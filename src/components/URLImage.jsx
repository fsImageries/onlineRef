import React, { useRef } from "react";
import { Image } from "react-konva";
import useImage from "use-image";


const URLImage = ({imageProps, onSelect, onChange }) => {
    const [image] = useImage(imageProps.src);
    const shapeRef = useRef();
  
    // console.log(imageProps)
    return (
    <Image 
      {...imageProps}
  
      image={image} 
      name="image" 
      draggable
      onClick={() => onSelect(shapeRef)}
      onTap={() => onSelect(shapeRef)}
      ref={shapeRef}
  
      onDragEnd={(e) => {
        onChange({
          ...imageProps,
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={(e) => {
        // transformer is changing scale of the node
        // and NOT its width or height
        // but in the store we have only width and height
        // to match the data better we will reset scale on transform end
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
  
        // we will reset it back
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          src:imageProps.src,
          x: node.x(),
          y: node.y(),
          // set minimal value
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(node.height() * scaleY)
        });
      }}
      />)
};
  

export default URLImage;
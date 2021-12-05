import React from "react";
import { Line } from "react-konva";

const Guides = ({ guides }) => {
  //   const guides = [];
  return guides.map((item, idx) => {
    return (
      <Line
        key={idx}
        {...{
          ...item,
          offset: { x: item.offset, y: item.offset },
        }}
      />
    );
  });
};

export default Guides;

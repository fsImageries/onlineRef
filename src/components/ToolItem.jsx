import React from "react";

const ToolItem = ({icon, onClick, reference, className}) => {
  return (
    <div ref={reference} className={`toolItem ${className}`} onClick={onClick}>
      <i className={icon}></i>
    </div>
  );
};

export default ToolItem;

import React from "react";




const ToolItem = ({ icon, onClick, reference, className, toolTip }) => {
  return (
    <div ref={reference} title={toolTip && toolTip} className={`toolItem ${className}`} onClick={onClick}>
      <i className={icon}></i>
    </div>
  );
};

export default ToolItem;

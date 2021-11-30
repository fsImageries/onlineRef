import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const rightStyle = { position: "absolute", top: "0", right: "0" };
const leftStyle = { position: "absolute", bottom: "0", left: "0" };

const DropZoneSVG = ({ isRight, controller }) => {
  const svgRef = useRef();
  const svgSel = gsap.utils.selector(svgRef);

  useLayoutEffect(() => {
    const tl = gsap.timeline({  });
    
    const fx = {
      ease: "expo.out",
      x: isRight ? 500 : -500,
      y: isRight? -500 : 500,

      // duration:0.01,
      stagger: 0.1,
    };

    // console.log(zone.current)
    // tl.from(zone.current, {zIndex:-1});
    tl.from(svgRef.current, {zIndex:-1});
    // tl.from(svgSel(".dropZone"), {zIndex:-1});
    tl.from(svgSel(".slide"), fx);
    tl.pause();
    controller.current[isRight? "right" : "left"] = tl;
  }, []);

  return (
    <svg
      id="visual"
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
      //   xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.1"
      style={isRight ? rightStyle : leftStyle}
      ref={svgRef}
    >
      {isRight && (
        <g transform="translate(900, 0)">
          <path className="slide"
            className="slide rightEnd"
            d="M0 405.6C-44.5 403 -89 400.4 -124.2 382.3C-159.5 364.2 -185.6 330.7 -223.4 307.4C-261.2 284.2 -310.7 271.2 -328.2 238.4C-345.6 205.6 -331 153 -338.6 110C-346.1 67 -375.9 33.5 -405.6 0L0 0Z"
            fill="#232745"
          ></path>
          <path
            className="slide rightMid2"
            d="M0 304.2C-33.4 302.3 -66.7 300.3 -93.2 286.7C-119.6 273.2 -139.2 248 -167.5 230.6C-195.9 213.1 -233 203.4 -246.1 178.8C-259.2 154.2 -248.3 114.8 -253.9 82.5C-259.6 50.2 -281.9 25.1 -304.2 0L0 0Z"
            fill="#96446e"
          ></path>
          <path
            className="slide rightMid1"
            d="M0 202.8C-22.2 201.5 -44.5 200.2 -62.1 191.2C-79.7 182.1 -92.8 165.3 -111.7 153.7C-130.6 142.1 -155.3 135.6 -164.1 119.2C-172.8 102.8 -165.5 76.5 -169.3 55C-173.1 33.5 -187.9 16.7 -202.8 0L0 0Z"
            fill="#f17c53"
          ></path>
          <path
            className="slide rightStart"
            d="M0 101.4C-11.1 100.8 -22.2 100.1 -31.1 95.6C-39.9 91.1 -46.4 82.7 -55.8 76.9C-65.3 71 -77.7 67.8 -82 59.6C-86.4 51.4 -82.8 38.3 -84.6 27.5C-86.5 16.7 -94 8.4 -101.4 0L0 0Z"
            fill="#fbae3c"
          ></path>
        </g>
      )}

      {!isRight && (
        <g transform="translate(0, 600)">
          <path className="slide"
            d="M0 -405.6C48.4 -409.6 96.7 -413.5 125.3 -385.8C154 -358.1 162.8 -298.7 197.5 -271.8C232.1 -244.9 292.6 -250.5 309.9 -225.1C327.1 -199.7 301.3 -143.4 310 -100.7C318.8 -58.1 362.2 -29 405.6 0L0 0Z"
            fill="#232745"
          ></path>
          <path className="slide"
            d="M0 -304.2C36.3 -307.2 72.5 -310.1 94 -289.3C115.5 -268.5 122.1 -224 148.1 -203.9C174.1 -183.7 219.4 -187.9 232.4 -168.8C245.4 -149.8 226 -107.6 232.5 -75.6C239.1 -43.5 271.7 -21.8 304.2 0L0 0Z"
            fill="#96446e"
          ></path>
          <path className="slide"
            d="M0 -202.8C24.2 -204.8 48.4 -206.7 62.7 -192.9C77 -179 81.4 -149.4 98.7 -135.9C116.1 -122.5 146.3 -125.3 154.9 -112.6C163.6 -99.9 150.6 -71.7 155 -50.4C159.4 -29 181.1 -14.5 202.8 0L0 0Z"
            fill="#f17c53"
          ></path>
          <path className="slide"
            d="M0 -101.4C12.1 -102.4 24.2 -103.4 31.3 -96.4C38.5 -89.5 40.7 -74.7 49.4 -68C58 -61.2 73.1 -62.6 77.5 -56.3C81.8 -49.9 75.3 -35.9 77.5 -25.2C79.7 -14.5 90.6 -7.3 101.4 0L0 0Z"
            fill="#fbae3c"
          ></path>
        </g>
      )}
    </svg>
  );
};

export default DropZoneSVG;

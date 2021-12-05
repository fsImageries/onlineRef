import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import {useController} from "src/js/controllers"


const LinkFieldSVG = () => {
  const svgRef = useRef();
  const svgSel = gsap.utils.selector(svgRef);
  const {link:controller} = useController()

  useLayoutEffect(() => {
    const tl = gsap.timeline({ duration: 1, paused: true });

    const fx = {
      ease: "Expo.easeOut",
      scale: 0.0,
      transformOrigin: "center",
      delay: -1,
      stagger: 0.1,
      zIndex: 0
    };

    tl.from(svgSel(".slide"), fx);
    controller.con.svgTl = tl;
  }, []);

  return (
    <svg
      ref={svgRef}
      id="visual"
      viewBox="0 0 900 600"
      width="900"
      height="600"
      xmlns="http://www.w3.org/2000/svg"
      className="linkFieldSvg"
    >
      <g className="innerParts" transform="translate(427.76777625939775 273.13314100824914)">
        <g className="slide">
          <path
            d="M72.5 -112.2C105 -106.8 149.9 -109.6 171.2 -92.3C192.6 -75 190.3 -37.5 186.7 -2.1C183.1 33.3 178.1 66.7 161.2 91.6C144.3 116.6 115.4 133.2 86.5 153.4C57.7 173.5 28.8 197.3 5 188.5C-18.8 179.8 -37.5 138.6 -59 114.2C-80.5 89.8 -104.8 82.1 -120.1 65.9C-135.4 49.7 -141.7 24.8 -143.8 -1.2C-146 -27.3 -144 -54.7 -131.7 -76C-119.4 -97.4 -96.7 -112.8 -73 -123.3C-49.3 -133.8 -24.7 -139.4 -2.3 -135.3C20 -131.3 40 -117.6 72.5 -112.2"
            fill="#232745"
          ></path>
        </g>
        <g className="slide" transform="scale(.75) rotate(5)">
          <path
            d="M72.5 -112.2C105 -106.8 149.9 -109.6 171.2 -92.3C192.6 -75 190.3 -37.5 186.7 -2.1C183.1 33.3 178.1 66.7 161.2 91.6C144.3 116.6 115.4 133.2 86.5 153.4C57.7 173.5 28.8 197.3 5 188.5C-18.8 179.8 -37.5 138.6 -59 114.2C-80.5 89.8 -104.8 82.1 -120.1 65.9C-135.4 49.7 -141.7 24.8 -143.8 -1.2C-146 -27.3 -144 -54.7 -131.7 -76C-119.4 -97.4 -96.7 -112.8 -73 -123.3C-49.3 -133.8 -24.7 -139.4 -2.3 -135.3C20 -131.3 40 -117.6 72.5 -112.2"
            fill="#96446e"
          ></path>
        </g>
        <g className="slide" transform="scale(.5), rotate(10)">
          <path
            d="M72.5 -112.2C105 -106.8 149.9 -109.6 171.2 -92.3C192.6 -75 190.3 -37.5 186.7 -2.1C183.1 33.3 178.1 66.7 161.2 91.6C144.3 116.6 115.4 133.2 86.5 153.4C57.7 173.5 28.8 197.3 5 188.5C-18.8 179.8 -37.5 138.6 -59 114.2C-80.5 89.8 -104.8 82.1 -120.1 65.9C-135.4 49.7 -141.7 24.8 -143.8 -1.2C-146 -27.3 -144 -54.7 -131.7 -76C-119.4 -97.4 -96.7 -112.8 -73 -123.3C-49.3 -133.8 -24.7 -139.4 -2.3 -135.3C20 -131.3 40 -117.6 72.5 -112.2"
            fill="#f17c53"
          ></path>
        </g>
      </g>
    </svg>
  );
};

export default LinkFieldSVG;

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";

import DropZoneSVG from "components/DropZoneSVG";
import {useController } from "js/controllers"

const DropZone = () => {
  const zoneRef = useRef();
  const zoneSel = gsap.utils.selector(zoneRef);
  const controller = useController();

  useLayoutEffect(() => {
    const tl = gsap.timeline({});

    const fx = {
      background: "rgba(10, 10, 20, 0)",
      backdropFilter: "blur(0px)",
    };

    const fx2 = {
      duration: 0.2,
      opacity: 0,
    };

    tl.from(zoneRef.current, fx);
    tl.from(zoneSel(".text"), fx2);
    tl.pause();
    controller.con.zone = tl;

    controller.con.anim = (rev = false) => {
      if (rev) {
        controller.con.left.reverse();
        controller.con.right.reverse();
        controller.con.zone.reverse();
      } else {
        controller.con.left.play();
        controller.con.right.play();
        controller.con.zone.play();
      }
    };
  }, []);

  return (
    <div className="dropZone" ref={zoneRef}>
      <div className="text">Just drop it in here.</div>
      <DropZoneSVG isRight={true}/>
      <DropZoneSVG isRight={false}/>
    </div>
  );
};

export default DropZone;

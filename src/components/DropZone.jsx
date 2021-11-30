import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";

import DropZoneSVG from "components/DropZoneSVG";

const DropZone = ({ controller }) => {
  const zoneRef = useRef();
  const zoneSel = gsap.utils.selector(zoneRef);

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
    controller.current.zone = tl;
  }, []);
  return (
    <div className="dropZone" ref={zoneRef}>
      <div className="text">Just drop it in here.</div>
      <DropZoneSVG isRight={true} controller={controller} />
      <DropZoneSVG isRight={false} controller={controller} />
    </div>
  );
};

export default DropZone;

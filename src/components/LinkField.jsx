import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import LinkFieldSVG from "components/LinkFieldSVG";

const LinkField = ({ controller }) => {
  const linkInputRef = useRef();
  const linkSel = gsap.utils.selector(linkInputRef);

  useLayoutEffect(() => {
    const tl = gsap.timeline({ paused: true });

    const fx = {
      ease: "Expo.easeOut",
      scaleX: 0,
      zIndex: 0,
      delay: 0.2,
    };
    const fx2 = {
      duration: .25,
      zIndex: 0,
      opacity: 0,
    };
    const fx3 = {
      scaleY: 0,
      opacity: 0,
    };

    tl.from(linkInputRef.current, fx2);
    tl.from(linkSel(".linkInput"), fx);
    tl.from(linkSel(".linkText"), fx3);

    controller.current.input = tl;

    const closeLinkField = (e) => {
      const key_check = e.type === "keydown" && e.key === "Escape";
      const click_check =
        !e.target.closest(".innerParts, input") &&
        !tl.paused() &&
        !!tl.totalProgress();

      if (key_check || click_check) {
        controller.current.input.reverse();
        controller.current.svgTl.reverse();
      }
    };

    const addListeners = (del = false) => {
      "click tap keydown".split(" ").forEach((elem) => {
        window[del ? "removeEventListener" : "addEventListener"](elem, (e) =>
          closeLinkField(e)
        );
      });
    };

    addListeners();

    return () => addListeners((del = true));
  }, []);

  return (
    <div className="linkField" ref={linkInputRef}>
      <div className="linkText">Enter a link here:</div>
      <input type="text" name="linkInput" className="linkInput" />
      <LinkFieldSVG controller={controller} />
    </div>
  );
};

export default LinkField;

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import LinkFieldSVG from "components/LinkFieldSVG";

const LinkField = ({ controller, onEnter }) => {
  const linkFieldRef = useRef();
  const linkSel = gsap.utils.selector(linkFieldRef);

  const inputRef = useRef();

  useLayoutEffect(() => {
    const tl = gsap.timeline({ paused: true });

    const fx = {
      ease: "Expo.easeOut",
      scaleX: 0,
      zIndex: 0,
      delay: 0.2,
    };
    const fx2 = {
      duration: 0.25,
      zIndex: 0,
      opacity: 0,
    };
    const fx3 = {
      scaleY: 0,
      opacity: 0,
    };

    tl.from(linkFieldRef.current, fx2);
    tl.from(linkSel(".linkInput"), fx);
    tl.from(linkSel(".linkText"), fx3);

    controller.current.input = tl;

    controller.current.anim = (open = true) => {
      if (open) {
        controller.current.svgTl.play();
        controller.current.input.play();
        controller.current.setActive(true);
        return;
      }
      controller.current.input.reverse();
      controller.current.svgTl.reverse();
      controller.current.setActive(false);
    };

    const closeLinkField = (e) => {
      const key_check = e.type === "keydown" && e.key === "Escape";
      const click_check =
        !e.target.closest(".innerParts, input") &&
        !tl.paused() &&
        !!tl.totalProgress();

      if (key_check || click_check) {
        controller.current.anim(false);
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
    <div className="linkField" ref={linkFieldRef}>
      <div className="linkText">Enter a link here:</div>
      <input
        ref={inputRef}
        type="text"
        name="linkInput"
        className="linkInput"
        onKeyDown={(e) => onEnter(e, inputRef.current)}
      />
      <LinkFieldSVG controller={controller} />
    </div>
  );
};

export default LinkField;

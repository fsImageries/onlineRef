import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import LinkFieldSVG from "src/components/LinkFieldSVG";
import { useController } from "src/js/controllers";
import { useEffectState } from "src/js/helper";
import { useMedia } from "src/states/media";
import { useStageConfig } from "src/states/stageConfig";
import * as imgHelp from "src/js/imageHelpers";
// import useImage from "src/use-image";

const LinkField = () => {
  const [isOpen, setOpen] = useEffectState(false);

  const linkFieldRef = useRef();
  const linkSel = gsap.utils.selector(linkFieldRef);
  const inputRef = useRef();
  const {link:controller} = useController();
  const media = useMedia();
  const config = useStageConfig();

  const inputHandler = async (e) => {
    if (e.key === "Enter") {
      const src = e.target.value;
      const url = await imgHelp.test_url(src);

      controller.con.anim(false);
      e.target.value = "";
      e.target.blur()
      if (!url) return;
      const img = await imgHelp.build_img(url, config.config);
      if (img) media.addMedia(img);
    }
  };

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

    controller.con.input = tl;

    controller.con.anim = (force = null) => {
      const newOpen = force === null ? !isOpen.current : force;
      setOpen(newOpen);
      controller.con.callback(newOpen);
      if (newOpen) {
        controller.con.svgTl.play();
        controller.con.input.play();
        return newOpen;
      }
      controller.con.input.reverse();
      controller.con.svgTl.reverse();

      return newOpen;
    };

    const closeLinkField = (e) => {
      const key_check = e.type === "keydown" && e.key === "Escape";
      const click_check =
        !e.target.closest(".innerParts, input") &&
        !tl.paused() &&
        !!tl.totalProgress();

      if (key_check || click_check) {
        controller.con.anim(false);
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

    return () => addListeners(true);
  }, []);

  return (
    <div className="linkField" ref={linkFieldRef}>
      <div className="linkText">Enter a link here:</div>
      <input
        ref={inputRef}
        type="text"
        name="linkInput"
        className="linkInput"
        onKeyDown={inputHandler}
      />
      <LinkFieldSVG controller={controller} />
    </div>
  );
};

export default LinkField;

import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import $ from "jquery";

import ToolItem from "components/ToolItem";
import bg_img from "images/menu_bg.svg";

const tl_reducer = (tl, action) => {
  switch (action) {
    case false:
      tl.timeScale(1);
      tl.play();
      break;
    case true:
      tl.timeScale(1.5);
      tl.reverse();
      break;
  }
};

const ToolBar = ({ icons, funcs, isActive, controller }) => {
  $(":root").css("--bg-menu", `url(${bg_img})`);

  const [isOpen, setOpen] = useState(false);

  const toolbarBgRef = useRef();
  const settingsRef = useRef();
  const toolbarRef = useRef();
  const tlRef = useRef();

  const toolBarSelect = gsap.utils.selector(toolbarRef);

  useLayoutEffect(() => {
    const tl = gsap.timeline({ duration: 0.1 });
    const fx = {
      x: 100,
      delay: -0.6,
      stagger: 0.1,
    };

    tl.from(toolBarSelect(".toolItem:not(:nth-child(1))"), fx);
    tl.reverse();
    tlRef.current = tl;

  }, []);

  controller.current.anim = () => {
    const newOpen = !isOpen
    setOpen(newOpen);
    tl_reducer(tlRef.current, isOpen);

    if (!newOpen) 
      toolbarBgRef.current.scroll({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      ref={toolbarBgRef}
      className={`toolBarBg ${isOpen ? "" : "hide"}`}
      onScroll={() => {
        // backdrop-filter: blur doesn't update on scrollable div's, this is a quick and dirty fix
        const val = $(".toolBar").css("backdrop-filter").includes("50")
          ? 49.99
          : 50;
        $(".toolBar").css("backdrop-filter", `blur(${val}px)`);
      }}
    >
      <div className={`toolBar ${isOpen ? "" : "hide"}`} ref={toolbarRef}>
        <ToolItem
          reference={settingsRef}
          icon={icons[0]}
          onClick={() => {
            // setOpen(!isOpen);
            // tl_reducer(tlRef.current, isOpen);
            controller.current.anim();
          }}
          className={`settingsAll ${isOpen ? "" : "hide"}`}
        />
        {icons.slice(1, icons.length).map((item, idx) => {
          return (
            <ToolItem
              icon={item}
              key={idx}
              className={isActive[idx] && "active"}
              onClick={(e) => {
                const func = funcs[idx];
                if (func) func(e);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ToolBar;

import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import $ from "jquery";

import ToolItem from "src/components/ToolItem";
import { useStageStates } from "src/states/stageStates";
import { useSelection } from "src/states/selection";
import { useStoredConfig } from "src/states/storedConfig";
import { useMedia } from "src/states/media";
import { useController } from "src/js/controllers";
import get_funcs from "src/js/toolFuncs";

// import bg_img from "src/images/menu_bg.svg";


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

const topIcon = "fas fa-sliders-h";

const icons = [
  // add html spacer between
  "fas fa-question",
  "far fa-file-image",
  "fas fa-file-download",
  "fas fa-link",
  "fas fa-play",
  // "fas fa-mouse-pointer",
  "fas fa-arrows-alt",
  "fas fa-magnet",
  "fas fa-expand-arrows-alt",
  "fas fa-undo",
  "fas fa-arrow-up",
];

const toolTips = [
  `Show a help menu with more extensive documentation.`,
  `Import an image/video file or a stage config.\n[CTRL+I]`,
  `Export and download a stage config.\n[CTRL+S]`,
  `Import an image/video by link.\n[I]`,
  `Play selected video(s).\n[P]`,
  `Active stage drag/Deactive stage selection.\n[D]`,
  `Toggle Guides/Snap.\n[G]`,
  `Active resize/Deactive rotate on selected.\n[T]`,
  `Active rotate/Deactive resize on selected.\n[R]`,
  `Move selected image to foreground.\n[M]`,
];

const ToolBar = () => {
  const [isOpen, setOpen] = useState(false);
  const [isLinkFieldActive, setLinkFieldActive] = useState(false);

  const toolbarBgRef = useRef();
  const settingsRef = useRef();
  const toolbarRef = useRef();
  const tlRef = useRef();

  const toolBarSelect = gsap.utils.selector(toolbarRef);

  const stageStates = useStageStates();
  const {link: linkFieldCon, menu: controller} = useController();
  const selection = useSelection();
  const media = useMedia();
  const config = useStoredConfig();
  // const controller = useController();

  linkFieldCon.con.callback = (val) => {
    setLinkFieldActive(val);
  };

  const funcs = get_funcs(media, stageStates, selection, config, linkFieldCon);

  // const funcs = [
  //   () => {},
  //   () => {},
  //   () => {
  //     // console.log(
  //     //   helper.getStageState(config.config, media.media, settings.settings)
  //     // );
  //     // const stage = JSON.stringify(
  //     //   helper.getStageState(config.config, media.media, settings.settings)
  //     // );
  //     // helper.download(stage, "OnlineRef_Stage.json");
  //   },
  //   () => {
  //     linkFieldCon.con.anim();
  //   },
  //   () => {
  //     selection.nodesArray.forEach((node, i) => {
  //       if (node.attrs.type === "vid" && called) {
  //         const isPlaying = helper.isVideoPlaying(node.attrs.image);
  //         if (isPlaying) {
  //           node.attrs.image.pause();
  //         } else {
  //           node.attrs.image.play();
  //         }
  //       }
  //     });
  //   },
  //   () => {
  //     stageStates.setStageDrag(!stageStates.stageDrag);
  //   },
  //   () => {
  //     stageStates.setGuides(!stageStates.isGuides);
  //   },
  //   () => {
  //     stageStates.setResize(!stageStates.isResize);
  //   },
  //   () => {
  //     stageStates.setRot(!stageStates.isRot);
  //   },
  //   () => {
  //     const cur = selection.nodesArray[0];
  //     if (cur === undefined) return;
  //     const curIdx = media.media.findIndex((elem) => cur.attrs.id === elem.id);
  //     if (curIdx >= 0) {
  //       const temp = media.media.filter((_, idx) => idx !== curIdx);
  //       media.setMedia([...temp, media.media[curIdx]]);
  //     }
  //     selection.selectShape(null);
  //     selection.trRef.nodes([]);
  //     selection.setNodes([]);
  //   },
  // ];

  const isActive = [
    ,
    ,
    ,
    isLinkFieldActive,
    ,
    stageStates.stageDrag,
    stageStates.isGuides,
    stageStates.isResize,
    stageStates.isRot,
  ];

  const toolItems = icons.map((val, i) => [
    val,
    toolTips[i],
    funcs[i],
    isActive[i],
  ]);

  useLayoutEffect(() => {
    // $(":root").css("--bg-menu", `url(${bg_img})`);
    // $(":root").css("--bg-menu", new URL(bg_img).href);
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

  controller.con.anim = () => {
    const newOpen = !isOpen;
    setOpen(newOpen);
    tl_reducer(tlRef.current, isOpen);

    if (!newOpen) toolbarBgRef.current.scroll({ top: 0, behavior: "smooth" });
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
          icon={topIcon}
          onClick={() => {
            controller.con.anim();
          }}
          className={`settingsAll ${isOpen ? "" : "hide"}`}
        />
        {toolItems.map(([icon, toolTip, func, isActive], idx) => {
          return (
            <ToolItem
              icon={icon}
              key={idx}
              className={isActive && "active"}
              toolTip={toolTip && toolTip}
              onClick={(e) => {
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

import React, { useState, useEffect, useRef, useReducer } from "react";
import { Stage, Layer, Transformer, Rect, Line } from "react-konva";
import $ from "jquery";

import "styles.scss";
import bg_img from "images/bg_scatter2.svg";
import bg_settings from "images/link_field/end.svg";

import URLImage from "components/URLImage";
import URLVideo from "components/URLVideo";
import ToolBar from "components/ToolBar";
import DropZone from "components/DropZone";
import LinkField from "components/LinkField";
import SettingsMenu from "components/SettingsMenu";

import * as selection from "js/selection";
import * as dragDrop from "js/dragDrop";
import * as imgHelp from "js/imageHelpers";
import * as guidesHelp from "js/guides";
import * as menuBtns from "js/menuBtns";
import * as helper from "js/helper";
import { download } from "./js/helper";

const useEffectState = (init) => {
  const [state, _setState] = useState(init);
  const stateRef = useRef(state);
  const setState = (data) => {
    stateRef.current = data;
    _setState(data);
  };

  return [stateRef, setState];
};

let icons = [
  "fas fa-sliders-h",
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

const baseSettings = {
  stageBg: $(":root").css("--bg-color2"),
  showGuides: true,
};

let curSelectionInitial = {
  visible: false,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
};

const activeReducer = (isActive, action) => {
  const temp = isActive.slice();
  temp[action.idx] = action.act;
  return temp;
};

const stageStatesReducer = (states, action) => {
  if (!action.notAct) action.setActive({ idx: action.actIdx, act: action.act });

  let temp = Object.entries(states);
  const [prop, _] = temp[action.idx];
  states[prop] = action.act;
  return states;
};

const App = () => {
  const stored = helper.getStoredSettings();
  const [settings, setSettings] = useState(
    stored === null ? { ...baseSettings } : stored
  );

  const settingsCon = useRef({ main: null, anim: null });
  const settingsFuncs = [
    (e) => {
      setSettings({
        ...settings,
        stageBg: $(":root").css("--var-bg-color"),
        showGuides: showGuides,
      });
      settingsCon.current.anim(false);
    },
    (e) => {
      setSettings({ ...baseSettings });
    },
    (e) => {
      $(":root").css("--var-bg-color", helper.hex2rgb(e.target.value));
    },
    (e) => {
      setShowGuides(e.target.checked);
    },
  ];

  const [media, setMedia] = useEffectState([]);
  const [config, setConfig] = useEffectState({
    scaleX: 1,
    scaleY: 1,
    width: window.innerWidth,
    height: window.innerHeight,
    x: 0,
    y: 0,
  });

  const [selectedId, selectShape] = useState(null);
  const [nodesArray, setNodes] = useEffectState([]);

  const stageRef = useRef();
  const layerRef = useRef();
  const trRef = useRef();
  const selectionRectRef = useRef();
  const curSelection = useRef({ ...curSelectionInitial });

  const [scaleBy, setScaleBy] = useEffectState(1.02);

  const [isActive, setActive] = useReducer(
    activeReducer,
    new Array(icons.length).fill(false)
  );

  const dropCon = useRef({ right: null, left: null });
  const animDropSvg = (rev = false) => {
    if (rev) {
      dropCon.current.left.reverse();
      dropCon.current.right.reverse();
      dropCon.current.zone.reverse();
    } else {
      dropCon.current.left.play();
      dropCon.current.right.play();
      dropCon.current.zone.play();
    }
  };

  const linkCon = useRef({
    svgTl: null,
    input: null,
    setActive: (val) => setActive({ idx: 3, act: val }),
    isActive: isActive[3],
  });
  const inputHandler = async (e, ref) => {
    if (e.key === "Enter") {
      const src = ref.value;
      const url = await imgHelp.test_url(src);

      linkCon.current.anim(false);
      ref.value = "";
      if (!url) return;
      const img = await imgHelp.build_img(url, config.current);
      if (img) setMedia([...media.current, img]);
    }
  };
  const menuBtnCon = useRef({ anim: null });

  const [stageStates, setStageStates] = useReducer(
    (states, action) => {
      action = { ...action, setActive: setActive };
      return stageStatesReducer(states, action);
    },
    {
      stageDrag: false,
      isResize: false,
      isRot: false,
      rotateFree: false,
      isGuides: false,
    }
  );

  const setDrag = (val) => {
    const action = { act: val, actIdx: 5, idx: 0 };
    if (val) curSelection.current = { ...curSelectionInitial };
    setStageStates(action);
  };

  const setResize = (val) => {
    const action = { act: val, actIdx: 7, idx: 1 };
    setStageStates(action);
  };

  const setRot = (val) => {
    const action = { act: val, actIdx: 8, idx: 2 };
    setStageStates(action);
  };

  const setRotateFree = (val) => {
    const action = { act: val, idx: 3 };
    setStageStates(action);
  };

  const setIsGuides = (val) => {
    const action = { act: val, actIdx: 6, idx: 4 };
    setStageStates(action);
  };

  const toolBtnFuncs = [
    () => {},
    () =>
      menuBtns.get_fileDialog(
        media.current,
        [setMedia, load_stageState],
        config.current
      ),
    () => {
      console.log(
        helper.getStageState(config.current, media.current, settings)
      );
      const stage = JSON.stringify(
        helper.getStageState(config.current, media.current, settings)
      );
      download(stage, "OnlineRef_Stage.json");
    },
    () => {
      linkCon.current.anim();
    },
    (called=false) => {
      nodesArray.current.forEach((node, i) => {
        if (node.attrs.type === "vid" && called) {
          const isPlaying = helper.isVideoPlaying(node.attrs.image);
          if (isPlaying) {
            node.attrs.image.pause();
          } else {
            node.attrs.image.play();
          }
        }
      });
    },
    () => {
      setDrag(!stageStates.stageDrag);
    },
    () => {
      setIsGuides(!stageStates.isGuides);
    },
    () => {
      setResize(!stageStates.isResize);
      if (stageStates.isRot) setRot(false);
    },
    () => {
      setRot(!stageStates.isRot);
      if (stageStates.isResize) setResize(false);
    },
    () => {
      const cur = nodesArray.current[0];
      if (cur === undefined) return;
      const curIdx = media.current.findIndex(
        (elem) => cur.attrs.id === elem.id
      );

      if (curIdx >= 0) {
        const temp = media.current.filter((_, idx) => idx !== curIdx);
        setMedia([...temp, media.current[curIdx]]);
      }
    },
  ];

  const duplicate_selected = async (nodesArray) => {
    const newMedia = await Promise.all(
      nodesArray.map(async (node) => {
        const curMedia = media.current.filter(
          (elem) => elem.id === node.attrs.id
        )[0];

        const x = curMedia.x - 50;
        const y = curMedia.y - 50;

        const ret = await imgHelp.build_img(curMedia.src, config.current, {
          x: x,
          y: y,
          width: curMedia.width,
          height: curMedia.height,
          noMod: true,
        });
        return ret;
      })
    );

    setMedia([...media.current, ...newMedia]);
  };

  const delete_selected = () => {
    const newMedia = media.current.filter((elem) => {
      let isSelected = true;
      for (let i = 0; i < nodesArray.current.length; i++) {
        const cur = nodesArray.current[i];
        if (cur.attrs.id === elem.id) isSelected = false;
      }
      return isSelected;
    });

    setMedia(newMedia);
    selectShape(null);
    trRef.current.nodes([]);
    setNodes([]);
  };

  const wheelHandler = (e) => {
    e.evt.preventDefault();

    // const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getRelativePointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getRelativePointerPosition().y / oldScale - stage.y() / oldScale,
    };

    let newScale =
      e.evt.deltaY < 0
        ? oldScale * scaleBy.current
        : oldScale / scaleBy.current;
    newScale = Math.max(0.02, newScale);

    setConfig({
      ...config.current,
      scaleX: newScale,
      scaleY: newScale,
      x:
        (stage.getRelativePointerPosition().x / newScale - mousePointTo.x) *
        newScale,
      y:
        (stage.getRelativePointerPosition().y / newScale - mousePointTo.y) *
        newScale,
    });
  };

  const [guides, setGuides] = useEffectState([]);
  const [showGuides, setShowGuides] = useState(settings.showGuides);

  const load_stageState = async (state) => {
    const inConfig = state.config;
    const inMedia = await Promise.all(
      state.media.map(async (val, i) => {
        // return {...val, noMod:true}
        const img = await imgHelp.build_img(val.src, inConfig, val);
        return img;
      })
    );

    setConfig({ ...config.current, ...state.config });
    setSettings(state.settings);
    setMedia(inMedia);
  };

  useEffect(() => {
    $(":root").css("--bg-img", `url(${bg_img})`);
    $(":root").css("--bg-settings", `url(${bg_settings})`);

    // document.addEventListener("click", (e) => {console.log(e.target)})

    const keyHandler = (e) => {
      setRotateFree(e.shiftKey);
      setScaleBy(e.shiftKey ? 1.5 : 1.02);

      if (e.type === "keydown") {
        // console.log(e.key);

        if (["Delete", "Backspace", "x"].includes(e.key)) delete_selected();

        if (e.ctrlKey && e.key === "i") toolBtnFuncs[1]();

        if (e.ctrlKey && e.key === "s") {
          e.preventDefault();
          toolBtnFuncs[2]();
        }

        if (e.ctrlKey && e.key === "d") {
          e.preventDefault();
          duplicate_selected(nodesArray.current);
        }

        if (e.key === "q") menuBtnCon.current.anim();

        if (e.key === "i" && !e.ctrlKey) toolBtnFuncs[3]();

        if (e.key === "p") toolBtnFuncs[4]();

        if (e.key === "d" && !e.ctrlKey) toolBtnFuncs[5]();

        if (e.key === "p") {
          console.log("Hi")
          toolBtnFuncs[4](true);
        }

        if (e.key === "g") toolBtnFuncs[6]();

        if (e.key === "t") toolBtnFuncs[7]();

        if (e.key === "r") toolBtnFuncs[8]();

        if (e.key === "m") toolBtnFuncs[9]();

        //   if (e.ctrlKey && e.key === "s") {
        //     e.preventDefault();
        //     $(".fileDown").trigger("click");
        //   }
      }
    };

    document.addEventListener("keyup", keyHandler);
    document.addEventListener("keydown", keyHandler);

    const resizeHandler = () => {
      setConfig({
        ...config.current,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const dragoverHandler = (e) => {
      animDropSvg();
      e.preventDefault();
    };

    const dragleaveHandler = (e) => {
      animDropSvg(true);
    };

    const dropHandler = (e) => {
      e.dataTransfer.getText = () => e.dataTransfer.getData("text");
      e.dataTransfer.getHTML = () => e.dataTransfer.getData("text/html");
      animDropSvg(true);
      e.preventDefault();
      dragDrop.dropHandler(e, media.current, setMedia, config.current, {
        x: (e.pageX - config.current.x) / config.current.scaleX,
        y: (e.pageY - config.current.y) / config.current.scaleY,
        // ...stageRef.current.getStage().getRelativePointerPosition()
      });
    };

    const handleListeners = (del = false) => {
      window[del ? "removeEventListener" : "addEventListener"](
        "dragover",
        dragoverHandler
      );
      window[del ? "removeEventListener" : "addEventListener"](
        "dragleave",
        dragleaveHandler
      );
      window[del ? "removeEventListener" : "addEventListener"](
        "drop",
        dropHandler
      );
      window[del ? "removeEventListener" : "addEventListener"](
        "resize",
        resizeHandler
      );
    };

    handleListeners();
    return () => handleListeners((del = true));
  }, []);

  useEffect(() => {
    helper.setStoredSettings(settings);
    $(":root").css("--var-bg-color", settings.stageBg);
    setShowGuides(settings.showGuides);
  }, [settings]);

  const url = "https://art.art/wp-content/uploads/2021/09/jamesnielsen_art.jpg";
  return (
    <>
      <LinkField controller={linkCon} onEnter={inputHandler} />
      <ToolBar
        icons={icons}
        toolTips={toolTips}
        funcs={toolBtnFuncs}
        isActive={isActive}
        controller={menuBtnCon}
      />
      <DropZone controller={dropCon} />
      <SettingsMenu
        controller={settingsCon}
        funcs={settingsFuncs}
        states={[settings.stageBg, showGuides]}
      />

      <Stage
        {...config.current}
        ref={stageRef}
        draggable={stageStates.stageDrag}
        onDblClick={async (e) => {
          settingsCon.current.anim();

          // const some = await imgHelp.build_img(url, config.current, {
          //   ...stageRef.current.getRelativePointerPosition(),
          // });
          // setMedia([...media.current, some]);
          // animDropSvg();
          // setConfig({...config.current, scaleX:2, scaleY:2})
        }}
        onWheel={wheelHandler}
        onDragEnd={() => {
          if (!stageStates.stageDrag) return;
          setConfig({ ...config.current, ...stageRef.current.position() });
        }}
        onTouchStart={(e) => {
          selection.checkDeselect(e, trRef, selectShape, setNodes);
        }}
        onMouseDown={(e) => {
          if (stageStates.stageDrag) return;
          selection.onMouseDown(
            e,
            curSelection,
            selectionRectRef,
            stageRef.current.position()
          );
        }}
        onMouseMove={(e) => {
          if (stageStates.stageDrag) return;
          selection.onMouseMove(
            e,
            curSelection,
            selectionRectRef,
            stageRef.current.position()
          );
        }}
        onMouseUp={(e) => {
          if (stageStates.stageDrag) return;
          setConfig({ ...config.current, ...stageRef.current.position() });
          selection.onMouseUp(
            trRef,
            layerRef,
            selectionRectRef,
            curSelection,
            setNodes,
            stageRef.current.position()
          );
        }}
        onClick={(e) => {
          selection.onClickTap(e, layerRef, trRef, selectShape, setNodes);
        }}
      >
        <Layer
          ref={layerRef}
          onDragMove={(e) => {
            if (!stageStates.isGuides) return;
            guidesHelp.onDragMove(e, stageRef, setGuides, showGuides);
          }}
          onDragEnd={(e) => {
            if (!stageStates.isGuides) return;
            guidesHelp.onDragEnd(e, setGuides);
          }}
        >
          {media.current.map((item, index) => {
            // console.log(item)
            const props = {
              imageProps: item,
              isSelected: index === selectedId,
              onChange: (newAttrs) => {
                const meds = media.current.slice();
                meds[index] = newAttrs;
                setMedia(meds);
              },
              idx: index,
              key: index,
            };

            if (item.type === "img") return <URLImage {...props} />;
            else return <URLVideo {...props} />;
          })}

          {stageStates.isGuides &&
            guides.current.map((item, idx) => {
              return (
                <Line
                  key={idx}
                  {...{ ...item, offset: { x: item.offset, y: item.offset } }}
                />
              );
            })}
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            rotateEnabled={stageStates.isRot}
            resizeEnabled={stageStates.isResize}
            borderStrokeWidth={nodesArray.current.length > 1 ? 0.25 : 0.1}
            rotationSnapTolerance={stageStates.rotateFree ? 0 : 5}
            {...{
              name: "transformer",
              borderStroke: "#00d0ff",
              anchorSize: 7.5,
              anchorStrokeWidth: 1,
              anchorStroke: "#b5b5b5",
              anchorCornerRadius: 50,
              rotationSnaps: [0, 45, 90, 135, 180, -45, -90, -135, -180],
              rotateAnchorOffset: 0,
            }}
          />
          <Rect fill="rgba(0,0,255,0.5)" ref={selectionRectRef} />
        </Layer>
      </Stage>
    </>
  );
};

export default App;

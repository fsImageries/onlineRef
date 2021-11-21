import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";
import $ from "jquery";
import { gsap } from "gsap";

import "styles.scss";
import img from "Beware_the_Goddess.jpg";
import bg_img from "images/bg_scatter2.svg";

import URLImage from "components/URLImage";
import ToolBar from "components/ToolBar";
import DropZoneSVG from "components/DropZoneSVG";
import LinkField from "components/LinkField";

import * as selection from "js/selection";
import * as dragDrop from "js/dragDrop";
import * as imgHelp from "js/imageHelpers";
import * as menuBtns from "js/menuBtns";

const useEventState = (init) => {
  const [state, _setState] = useState(init);
  const stateRef = useRef(state);
  const setState = (data) => {
    stateRef.current = data;
    _setState(data);
  };

  return [stateRef, setState];
};

const App = () => {
  const [media, setMedia] = useEventState([]);
  const [config, setConfig] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [selectedId, selectShape] = useState(null);
  const [nodesArray, setNodes] = useState([]);

  const stageRef = useRef();
  const layerRef = useRef();
  const trRef = useRef();
  const selectionRectRef = useRef();
  const curSelection = useRef({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  const dropCon = useRef({ right: null, left: null });
  const animDropSvg = (rev = false) => {
    if (rev) {
      dropCon.current.left.reverse();
      dropCon.current.right.reverse();
    } else {
      dropCon.current.left.play();
      dropCon.current.right.play();
    }
  };

  const linkCon = useRef({ svgTl: null, input: null });
  const toolBtnFuncs = [
    () => {},
    () => menuBtns.get_fileDialog(media.current, setMedia, config),
    () => {},
    () => {
      linkCon.current.input.play();
      linkCon.current.svgTl.play();
    },
  ];

  useEffect(() => {
    const resizeHandler = (e) => {
      setConfig({ ...config, w: window.innerWidth, h: window.innerHeight });
    };
    $(":root").css("--bg-img", `url(${bg_img})`);

    const dragoverHandler = (e) => {
      animDropSvg();
      e.preventDefault();
    };

    const dragleaveHandler = (e) => {
      animDropSvg(true);
    };

    const dropHandler = (e) => {
      e.preventDefault();
      animDropSvg(true);
      dragDrop.dropHandler(e, media.current, setMedia, config, {
        x: e.pageX,
        y: e.pageY,
      });
    };

    const handleListeners = (del=false) =>{
      window[del ? "removeEventListener" : "addEventListener"]("dragover", dragoverHandler);
      window[del ? "removeEventListener" : "addEventListener"]("drop", dropHandler);
      window[del ? "removeEventListener" : "addEventListener"]("dragleave", dragleaveHandler);
      window[del ? "removeEventListener" : "addEventListener"]("resize", resizeHandler);
    }

    handleListeners()
    return () => handleListeners(del=true);
  }, []);

  const borderWidth = () => {
    console.log("hi", nodesArray.length)
    return nodesArray.length > 1 ? 0.25 : 0
  }

  // console.log(nodesArray.length)
  const [pos, setPos] = useState({});
  const url = "https://art.art/wp-content/uploads/2021/09/jamesnielsen_art.jpg";
  return (
    <>
      <LinkField controller={linkCon} />
      <ToolBar funcs={toolBtnFuncs} />
      <div className="dropZone">
        <DropZoneSVG isRight={true} controller={dropCon} />
        <DropZoneSVG isRight={false} controller={dropCon} />
      </div>

      <Stage
        ref={stageRef}
        width={config.width}
        height={config.height}
        onDblClick={async (e) => {
          // const ret = await imgHelp.build_img(url, config);
          // setMedia([ret]);
          // console.log("H");
          // dropCon.current.right.play();
          // dropCon.current.left.play();
          // console.log(e.evt.pageX, e.evt.pageY);
          // console.log(stageRef.current.getPointerPosition());
          // setPos(stageRef.current.getRelativePointerPosition());
          linkCon.current.svgTl.play();
          linkCon.current.input.play();
          // $(".linkInput").toggleClass("active")
        }}
        onTouchStart={(e) =>
          selection.checkDeselect(e, trRef, selectShape, setNodes)
        }
        onMouseDown={(e) =>
          selection.onMouseDown(e, curSelection, selectionRectRef)
        }
        onMouseMove={(e) =>
          selection.onMouseMove(e, curSelection, selectionRectRef)
        }
        onMouseUp={(e) =>
          selection.onMouseUp(
            trRef,
            layerRef,
            selectionRectRef,
            curSelection,
            setNodes
            )
        }
        onClick={(e) =>
          selection.onClickTap(e, layerRef, trRef, selectShape, setNodes)
        }
      >
        <Layer ref={layerRef}>
          {/* <Rect {...pos} width={100} height={100} fill="red" /> */}
          {media.current.map((item, index) => {
            return (
              <URLImage
                imageProps={item}
                isSelected={index === selectedId}
                onSelect={(e) =>
                  selection.onLayerSelect(
                    e,
                    index,
                    trRef,
                    nodesArray,
                    setNodes,
                    selectShape
                  )
                }
                onChange={(newAttrs) =>
                  selection.onLayerChange(
                    newAttrs,
                    index,
                    media.current,
                    setMedia
                  )
                }
                idx={index}
                key={index}
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
            borderStrokeWidth={borderWidth()}
            {...{
              name:"transformer",
              borderStroke: "#00d0ff",
              anchorSize: 7.5,
              anchorStrokeWidth: 1,
              anchorStroke: "#b5b5b5",
              anchorCornerRadius: 50,
              rotationSnapTolerance: 0,
              rotationSnaps: [0, 45, 90, 135, 180, -45, -90, -135, -180],
              rotateAnchorOffset: 0,
              rotateEnabled: false,
              resizeEnabled: true}}
          />
          <Rect fill="rgba(0,0,255,0.5)" ref={selectionRectRef} />
        </Layer>
      </Stage>
    </>
  );
};

export default App;

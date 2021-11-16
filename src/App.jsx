import React, { useState, useEffect, useRef, useReducer } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";

import "styles.scss";
import img from "Beware_the_Goddess.jpg";

import URLImage from "components/URLImage";
import * as selection from "js/selection";
import * as imgHelp from "js/imageHelpers";
import * as dragDrop from "js/dragDrop";

const build_img = (src) => {
  const props = { x: 0, y: 0, src: src };
  const image = new window.Image();
  image.src = src;
  props.width = image ? image.width : 0;
  props.height = image ? image.height : 0;
  return props;
};

const img_reducer = (state, action) => {
  return { count: state.count + 1 };
};

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
  const Konva = window.Konva;

  const get_pointer = () => stageRef.current.getPointerPosition();

  useEffect(() => {
    const resizeHandler = (e) => {
      setConfig({ ...config, w: window.innerWidth, h: window.innerHeight });
    };

    const dragoverHandler = (e) => e.preventDefault();

    window.addEventListener("dragover", dragoverHandler);
    window.addEventListener("drop", (e) =>
      dragDrop.dropHandler(e, media.current, setMedia, config, get_pointer)
    );
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("dragover", dragoverHandler);
      window.removeEventListener("drop", dropHandler);
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <>
      <Stage
        ref={stageRef}
        width={config.width}
        height={config.height}
        onDblClick={async (e) => {
          const wu = await imgHelp.add_media(img, config, get_pointer);
          setMedia([...media.current, wu]);
          console.log(media.current);
        }}
        // onDblClick={() => setMedia([...media, "https://konvajs.org/assets/yoda.jpg"])}
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
            Konva
          )
        }
        onClick={(e) =>
          selection.onClickTap(e, layerRef, trRef, selectShape, setNodes)
        }
      >
        <Layer ref={layerRef}>
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
          />
          <Rect fill="rgba(0,0,255,0.5)" ref={selectionRectRef} />
        </Layer>
      </Stage>
    </>
  );
};

export default App;

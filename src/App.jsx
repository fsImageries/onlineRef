import React, { useState, useEffect, useRef, useReducer } from "react";
import { Stage, Layer, Transformer, Rect, Line } from "react-konva";
import $ from "jquery";

import "src/app.scss";

import bg_img from "src/images/bg_scatter2.svg";
import bg_menu from "src/images/menu_bg.svg";
import bg_settings from "src/images/link_field/end.svg";

import URLImage from "src/components/URLImage";
import URLVideo from "src/components/URLVideo";
import ToolBar from "src/components/ToolBar";
import DropZone from "src/components/DropZone";
import LinkField from "src/components/LinkField";
import SettingsMenu from "src/components/SettingsMenu";
import Guides from "src/components/Guides";

import * as selectHelp from "src/js/selection";
import * as dragDrop from "src/js/dragDrop";
import * as guidesHelp from "src/js/guides";
import * as helper from "src/js/helper";
import * as controllers from "src/js/controllers";
import * as stageFuncs from "src/js/stageFuncs";

import { Media, MediaProvider } from "src/states/media";
import { StageConfig, StageConfigProvider } from "src/states/stageConfig";
import { StoredConfig, StoredConfigProvider } from "src/states/storedConfig";
import { StageStates, StageStatesProvider } from "src/states/stageStates";
import { Selection, SelectionProvider } from "src/states/selection";
import get_funcs from "src/js/toolFuncs";


const App = () => {

  const settingsCon = new controllers.SettingsMenuController();
  const settings = new StoredConfig();

  const media = new Media();
  const config = new StageConfig();
  const selection = new Selection();
  const stageStates = new StageStates();

  const dropZoneCon = new controllers.DropZoneController();
  const linkFieldCon = new controllers.LinkFieldController();
  const menuCon = new controllers.DefaultController();

  const [guides, setGuides] = helper.useEffectState([]);

  useEffect(() => {
    $(":root").css("--bg-img", `url(${bg_img})`);
    $(":root").css("--bg-menu", `url(${bg_menu})`);
    $(":root").css("--bg-settings.settings", `url(${bg_settings})`);

    const toolBtnFuncs = get_funcs(
      media,
      stageStates,
      selection,
      config,
      settings,
      linkFieldCon
    );

    const keyHandler = (e) => {
      stageStates.setRotateFree(e.shiftKey);
      stageStates.setScaleBy(e.shiftKey);

      if (e.type === "keydown") {
        if (["Delete", "Backspace", "x"].includes(e.key)) toolBtnFuncs[11]();
        if (e.ctrlKey && e.key === "i") toolBtnFuncs[1]();
        if (e.key === "q" && !e.ctrlKey) menuCon.con.anim();
        if (e.key === "i" && !e.ctrlKey) toolBtnFuncs[3]();
        if (e.key === "p") toolBtnFuncs[4]();
        if (e.key === "d" && !e.ctrlKey) toolBtnFuncs[5]();
        if (e.key === "g") toolBtnFuncs[6]();
        if (e.key === "t") toolBtnFuncs[7]();
        if (e.key === "r") toolBtnFuncs[8]();
        if (e.key === "m") toolBtnFuncs[9]();

        if (e.key === "p") {
          toolBtnFuncs[4](e);
        }
        if (e.ctrlKey && e.key === "s") {
          e.preventDefault();
          toolBtnFuncs[2]();
        }
        if (e.ctrlKey && e.key === "d") {
          e.preventDefault();
          toolBtnFuncs[10]()
        }
        if (e.ctrlKey && e.key === "q") settingsCon.con.anim();
      }
    };

    const resizeHandler = () => {
      config.setConfig({
        ...config.config,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const dragoverHandler = (e) => {
      dropZoneCon.con.anim();
      e.preventDefault();
    };

    const dragleaveHandler = (e) => {
      dropZoneCon.con.anim(true);
    };

    const dropHandler = (e) => {
      e.dataTransfer.getText = () => e.dataTransfer.getData("text");
      e.dataTransfer.getHTML = () => e.dataTransfer.getData("text/html");
      dropZoneCon.con.anim(true);
      e.preventDefault();
      dragDrop.dropHandler(e, media.media, media.setMedia, config.config, {
        x: (e.pageX - config.config.x) / config.config.scaleX,
        y: (e.pageY - config.config.y) / config.config.scaleY,
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

      document[del ? "removeEventListener" : "addEventListener"]("keyup", keyHandler);
      document[del ? "removeEventListener" : "addEventListener"]("keydown", keyHandler);
    };

    handleListeners();
    return () => handleListeners(true);
  }, []);

  useEffect(() => {
    helper.setStoredSettings(settings.settings);
    $(":root").css("--var-bg-color", settings.settings.stageBg);
    // settings.setShowGuides(settings.showGuides);
  }, [settings.settings]);

  return (
    <StageStatesProvider value={stageStates}>
      <StoredConfigProvider value={settings}>
        <SelectionProvider value={selection}>
          <MediaProvider value={media}>
            <StageConfigProvider value={config}>
              <controllers.ControllerProvider value={settingsCon}>
                <SettingsMenu />
              </controllers.ControllerProvider>

              <controllers.ControllerProvider
                value={{ link: linkFieldCon, menu: menuCon }}
              >
                <LinkField />
                <ToolBar />
              </controllers.ControllerProvider>

              <controllers.ControllerProvider value={dropZoneCon}>
                <DropZone />
              </controllers.ControllerProvider>

              <Stage
                {...config.config}
                ref={selection._stageRef}
                draggable={stageStates.stageDrag}
                onDblClick={async (e) => {
                  settingsCon.con.anim();

                  // console.log(media.media);
                  // const some = await imgHelp.build_img(url, config.config, {
                  //   ...selection.stageRef.getRelativePointerPosition(),
                  // });
                  // media.setMedia([...media.media, some]);
                  // animDropSvg();
                  // config.setConfig({...config.config, scaleX:2, scaleY:2})
                }}
                onWheel={(e) =>
                  stageFuncs.wheelHandler(e, stageStates.scaleBy, (v) =>
                    config.addConfig(v)
                  )
                }
                onDragEnd={() => {
                  if (!stageStates.stageDrag) return;
                  config.setConfig({
                    ...config.config,
                    ...selection.stageRef.position(),
                  });
                }}
                onTouchStart={(e) => {
                  selectHelp.checkDeselect(e, selection);
                }}
                onMouseDown={(e) => {
                  if (stageStates.stageDrag) return;
                  selectHelp.onMouseDown(e, selection);
                }}
                onMouseMove={(e) => {
                  if (stageStates.stageDrag) return;

                  selectHelp.onMouseMove(e, selection);
                }}
                onMouseUp={(e) => {
                  if (stageStates.stageDrag) return;
                  config.setConfig({
                    ...config.config,
                    ...selection.stageRef.position(),
                  });
                  selectHelp.onMouseUp(selection);
                }}
                onClick={(e) => {
                  // selectHelp.onClickTap(e, selection._layerRef, selection._trRef, selection.selectShape, selection.setNodes);
                  selectHelp.onClickTap(e, selection);
                }}
              >
                <Layer
                  ref={selection._layerRef}
                  onDragMove={(e) => {
                    if (!stageStates.isGuides) return;
                    guidesHelp.onDragMove(
                      e,
                      selection._stageRef,
                      setGuides,
                      settings.showGuides
                    );
                  }}
                  onDragEnd={(e) => {
                    if (!stageStates.isGuides) return;
                    guidesHelp.onDragEnd(e, setGuides);
                  }}
                >
                  {media.media.map((item, index) => {
                    // console.log(item)
                    const props = {
                      imageProps: item,
                      isSelected: index === selection.selectedId,
                      onChange: (newAttrs) => {
                        const meds = media.media.slice();
                        meds[index] = newAttrs;
                        media.setMedia(meds);
                      },
                      idx: index,
                      key: index,
                    };

                    if (item.type === "img") return <URLImage {...props} />;
                    else return <URLVideo {...props} />;
                  })}

                  {stageStates.isGuides && <Guides guides={guides.current} />}
                  <Transformer
                    ref={selection._trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      // limit resize
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                    rotateEnabled={stageStates.isRot}
                    resizeEnabled={stageStates.isResize}
                    borderStrokeWidth={
                      selection.nodesArray.length > 1 ? 0.25 : 0.1
                    }
                    rotationSnapTolerance={stageStates.rotateFree ? 0 : 5}
                    {...{
                      name: "transformer",
                      borderStroke: "#00d0ff",
                      anchorSize: 7.5,
                      anchorStrokeWidth: 1,
                      anchorStroke: "#b5b5b5",
                      anchorCornerRadius: 50,
                      rotationSnaps: [
                        0, 45, 90, 135, 180, -45, -90, -135, -180,
                      ],
                      rotateAnchorOffset: 0,
                    }}
                  />
                  <Rect
                    fill="rgba(0,0,255,0.5)"
                    ref={selection._selectionRectRef}
                  />
                </Layer>
              </Stage>
            </StageConfigProvider>
          </MediaProvider>
        </SelectionProvider>
      </StoredConfigProvider>
    </StageStatesProvider>
  );
};

export default App;

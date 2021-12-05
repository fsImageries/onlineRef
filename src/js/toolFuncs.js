import $ from "jquery";
import * as imgHelp from "src/js/imageHelpers";
import * as helper from "src/js/helper";

const getStageState = (config, media, settings = null) => {
  const newMedia = media.map((elem, i) => {
    // remove image from media cuz we don't save it
    const { image, ...newElem } = elem;
    return newElem;
  });

  const { width, height, ...newConfig } = config;
  const stage = { config: newConfig, media: newMedia, settings: settings };

  return stage;
};

const setStageState = async (state, config, media, settings) => {
  const inConfig = state.config;
  const inMedia = await Promise.all(
    state.media.map(async (val, i) => {
      val = { ...val, noMod: true };
      const img = await imgHelp.build_img(val.src, inConfig, val);
      return img;
    })
  );

  config.setConfig({ ...config.config, ...state.config });
  settings.setSettings(state.settings);
  media.setMedia(inMedia);
};

const get_fileDialog = (addMedia, loadStage, config) => {
  const input = $(document.createElement("input"));
  input.attr("type", "file");
  input.prop("multiple", true);
  input.on("change", async () => {
    const files = Array.from(input.prop("files"));
    const isJson = files.filter((elem, i) => elem.type.includes("json"));

    if (!isJson.length) {
      const filesAttrs = await imgHelp.awaitAllFiles(
        input.prop("files"),
        config
      );
      //   setMedia([...media, ...filesAttrs]);filesAttrs
      // media.addMedia(filesAttrs, true)
      addMedia(filesAttrs);

      return filesAttrs;
    } else {
      const json = await helper.get_jsonFile(isJson[0]);
      console.log(json);
      //   setStage(json);
      loadStage(json);
    }
  });

  input.trigger("click"); // opening dialog
  return false; // avoiding navigation
};

const get_funcs = (
  media,
  stageStates,
  selection,
  config,
  settings,
  linkFieldCon
) => {
  return [
    () => {},
    /**
     * Load Media (Images/Videos) or Stage Config (JSON) from disk
     */
    () => {
      const loadStage = (state) => {
        setStageState(state, config, media, settings);
      };
      const addMedia = (inMedia) => {
        media.addMedia(inMedia, true);
      };
      get_fileDialog(addMedia, loadStage, config.config);
    },
    /**
     * Download Stage Config to disk
     */
    () => {
      const stage = JSON.stringify(
        getStageState(config.config, media.media, settings.settings)
      );
      helper.download(stage, "OnlineRef_Stage.json");
    },
    /**
     * Toggle the LinkField
     */
    () => {
      linkFieldCon.con.anim();
    },
    (called = false) => {
      selection.nodesArray.forEach((node) => {
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
    /**
     * Toggle Stage Drag
     */
    () => {
      stageStates.setStageDrag(!stageStates.stageDrag);
    },
    /**
     * Toggle Stage Guides
     */
    () => {
      stageStates.setGuides(!stageStates.isGuides);
    },
    /**
     * Toggle Media Resize
     */
    () => {
      stageStates.setResize(!stageStates.isResize);
    },
    /**
     * Toggle Media Rotate
     */
    () => {
      stageStates.setRot(!stageStates.isRot);
    },
    /**
     * Move selected node to top/foreground.
     * Returns when no node is selected.
     */
    () => {
      const cur = selection.nodesArray[0];
      if (cur === undefined) return;
      const curIdx = media.media.findIndex((elem) => cur.attrs.id === elem.id);
      if (curIdx >= 0) {
        const temp = media.media.filter((_, idx) => idx !== curIdx);
        media.setMedia([...temp, media.media[curIdx]]);
      }
      selection.selectShape(null);
      selection.trRef.nodes([]);
      selection.setNodes([]);
    },
    /**
     * Duplicate selected node(s)
     */
    async () => {
      const newMedia = await Promise.all(
        selection.nodesArray.map(async (node) => {
          const curMedia = media.media.filter(
            (elem) => elem.id === node.attrs.id
          )[0];

          const x = curMedia.x - 50;
          const y = curMedia.y - 50;

          const ret = await imgHelp.build_img(curMedia.src, config.config, {
            x: x,
            y: y,
            width: curMedia.width,
            height: curMedia.height,
            noMod: true,
          });
          return ret;
        })
      );
      media.addMedia(newMedia, true);
    },
    /**
     * Delete selected nodes from media
     */
    () => {
      const newMedia = media.media.filter((elem) => {
        let isSelected = true;
        for (let i = 0; i < selection.nodesArray.length; i++) {
          const cur = selection.nodesArray[i];
          if (cur.attrs.id === elem.id) isSelected = false;
        }
        return isSelected;
      });

      media.setMedia(newMedia);
      selection.selectShape(null);
      selection.trRef.nodes([]);
      selection.setNodes([]);
    },
  ];
};

export default get_funcs;

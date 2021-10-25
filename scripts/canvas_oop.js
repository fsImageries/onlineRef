import { isTouchDevice } from "./helpers.js";

const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getCenter = (p1, p2) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};

const getObjectSnappingEdges = (node) => {
  // what points of the object will trigger to snapping?
  // it can be just center of the object
  // but we will enable all edges and center
  var box = node.getClientRect();
  var absPos = node.absolutePosition();

  return {
    vertical: [
      {
        guide: Math.round(box.x),
        offset: Math.round(absPos.x - box.x),
        snap: "start",
      },
      {
        guide: Math.round(box.x + box.width / 2),
        offset: Math.round(absPos.x - box.x - box.width / 2),
        snap: "center",
      },
      {
        guide: Math.round(box.x + box.width),
        offset: Math.round(absPos.x - box.x - box.width),
        snap: "end",
      },
    ],
    horizontal: [
      {
        guide: Math.round(box.y),
        offset: Math.round(absPos.y - box.y),
        snap: "start",
      },
      {
        guide: Math.round(box.y + box.height / 2),
        offset: Math.round(absPos.y - box.y - box.height / 2),
        snap: "center",
      },
      {
        guide: Math.round(box.y + box.height),
        offset: Math.round(absPos.y - box.y - box.height),
        snap: "end",
      },
    ],
  };
};

const getGuides = (lineGuideStops, itemBounds, guideOffset) => {
  // find all snapping possibilities
  var resultV = [];
  var resultH = [];

  lineGuideStops.vertical.forEach((lineGuide) => {
    itemBounds.vertical.forEach((itemBound) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      // if the distance between guild line and object snap point is close we can consider this for snapping
      if (diff < guideOffset) {
        resultV.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((itemBound) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < guideOffset) {
        resultH.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  var guides = [];

  // find closest snap
  var minV = resultV.sort((a, b) => a.diff - b.diff)[0];
  var minH = resultH.sort((a, b) => a.diff - b.diff)[0];
  if (minV) {
    guides.push({
      lineGuide: minV.lineGuide,
      offset: minV.offset,
      orientation: "V",
      snap: minV.snap,
    });
  }
  if (minH) {
    guides.push({
      lineGuide: minH.lineGuide,
      offset: minH.offset,
      orientation: "H",
      snap: minH.snap,
    });
  }
  return guides;
};

class StageSingleton {
  constructor() {
    if (StageSingleton.instance instanceof StageSingleton) {
      return StageSingleton.instance;
    }
    this.stage = new CanvasStage();
    StageSingleton.instance = this;
  }
}

class CanvasStage {
  constructor() {
    this.stage = new Konva.Stage({
      container: "container",
      width: $(window).width(),
      height: $(window).height(),
    });
    this.selectionRect = new Konva.Rect({
      fill: "rgba(0,0,255,0.5)",
      visible: false,
    });
    this.mainTransformer = new Konva.Transformer({
      name: "transformer",
      borderStrokeWidth: 0.25,
      borderStroke: "#00d0ff",
      anchorSize: 7.5,
      anchorStrokeWidth: 1,
      anchorStroke: "#b5b5b5",
      anchorCornerRadius: 50,
      rotationSnapTolerance: 0,
      rotationSnaps: [0, 45, 90, 135, 180, -45, -90, -135, -180],
      rotateAnchorOffset: 0,
      rotateEnabled: false,
      resizeEnabled: true,
    });
    this.topLayer = new Konva.Layer();

    this.anim = new Konva.Animation(function () {
      // do nothing, animation just need to update the layer
    }, this.topLayer);

    this.stage.add(this.topLayer);
    this.topLayer.add(this.mainTransformer);
    this.topLayer.add(this.selectionRect);
    this.isTouch = isTouchDevice();

    // Configuration variables
    this.guideOffset = 15;
    this.scaleBy = 1.01;
    this.guidesAct = false;
    this.multScale = false;
    this.rotateAct = false;
    this.rotateFree = false;
    this.stageDrag = false;
    this.selectedShape;
    this.lastPointerPos = {
      x: $(window).width() / 2,
      y: $(window).height() / 2,
    };

    // Zoom variables
    this.lastDist = 0;
    this.lastCenter;

    this._init_select_zoom();
    this._init_events();
  }

  /////////////// Add media to stage ///////////////

  add_media(url, type, pos=false) {
    const add = (media, dims, pos = false, id = "image") => {
      pos = pos || {
        x: this.lastPointerPos.x - dims.w / 2,
        y: this.lastPointerPos.y - dims.h / 2,
      };

      const layer = new Konva.Image({
        x: pos.x,
        y: pos.y,
        image: media,
        width: dims.w,
        height: dims.h,
        name: id,
        draggable: true,
      });

      this.topLayer.add(layer);
      this.topLayer.draw();
      this.mainTransformer.nodes([layer]);
      this.mainTransformer.moveToTop();

      return layer;
    };

    const loadStr = type === "image" ? "load" : "loadedmetadata";
    const [width, height] =
      type === "image" ? ["width", "height"] : ["videoWidth", "videoHeight"];
    let mediaObj =
      type === "image" ? new Image() : document.createElement("video");
    mediaObj.src = url;

    $(mediaObj).on(loadStr, () => {
      const new_size = this._get_scaled_size({
        w: mediaObj[width],
        h: mediaObj[height],
      });
      const layer = add(
        mediaObj,
        { w: new_size.w, h: new_size.h },
        pos,
        type
      );

      if (type === "video") {
        mediaObj.play();
        this.anim.start();
        mediaObj.pause();
        this.video_play_hovered(mediaObj, layer);
      }
    });
  }

  file_2_url(file, type) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.add_media(reader.result, type);
  }

  url_2_canvas(url) {
    try {
      url = new URL(url); // Check if url is 'valid'
    } catch (_) {
      return false;
    }
    let resp;
    const request = new XMLHttpRequest();
    request.open("GET", url.href, true);
    request.responseType = "blob";
    request.onload = () => {
      const reader = new FileReader();
      reader.readAsDataURL(request.response);
      reader.onload = (e) => {
        resp = e.target.result;
        if (resp.includes("data:image")) this.add_media(url.href, "image");
        else if (resp.includes("data:video")) this.add_media(url.href, "video");
      };
    };
    request.send();
  }

  /////////////// Toggle functions on stage ///////////////

  toggle_rotation() {
    this.mainTransformer.rotationSnapTolerance(this.rotateFree ? 0 : 5);
    this.mainTransformer.resizeEnabled(this.rotateAct ? false : true);
    this.mainTransformer.rotateEnabled(!this.rotateAct ? false : true);
  }

  delete_selected() {
    if (this.selectedShape === undefined) return;

    for (let shape of this.selectedShape) shape.destroy();
    this.selectedShape = [];
    this.mainTransformer.nodes([]);
    this.topLayer.draw();
  }

  moveTT_selected() {
    if (this.selectedShape !== undefined && this.selectedShape.length) {
      const shape = this.selectedShape[0];
      shape.moveToTop();
      this.mainTransformer.moveToTop();
    }
  }

  duplicate_selected() {
    if (this.selectedShape !== undefined && this.selectedShape.length) {
      const percentW = ($(window).width() / 100) * 10;
      const percentH = ($(window).height() / 100) * 10;
      const shape = this.selectedShape[0];
      const pos = shape.position();

      this.add_media(shape.image().src, shape.name(), { x: pos.x - percentW, y: pos.y + percentH })

    }
  }

  video_play_selected() {
    if (this.selectedShape !== undefined && this.selectedShape.length) {
      const media = this.selectedShape[0].image();

      if (media.nodeName === "VIDEO") {
        if (media.paused) {
          media.play();
          this.anim.start();
        } else {
          media.pause();
          this.anim.stop();
        }
      }
    }
  }

  fit_stage() {
    this.stage.width($(window).width());
    this.stage.height($(window).height());
  }

  video_play_hovered(video, videoLayer) {
    videoLayer.on("mouseover", () => {
      video.play();
      this.anim.start();
    });

    videoLayer.on("mouseout", () => {
      video.pause();
      this.anim.stop();
    });
  }

  /////////////// Zoom and selection eventListeners ///////////////

  _init_select_zoom() {
    if (!this.isTouch) this.stage.on("wheel", (e) => this._wheel_zoom(e, this));

    let x1, y1, x2, y2;
    this.stage.on("mousedown touchstart", (e) => {
      if (!this.isTouch) {
        const key_check = e.evt.button === 1 || e.evt.altKey;
        this.stage.draggable(key_check || this.stageDrag);
      }

      if (e.target !== this.stage) return;

      x1 = x2 = this.stage.getRelativePointerPosition().x;
      y1 = y2 = this.stage.getRelativePointerPosition().y;
      this.selectionRect.visible(true);
      this.selectionRect.width(0);
      this.selectionRect.height(0);
    });

    this.stage.on("mousemove touchmove", (e) => {
      if (this.isTouch) this._pinch_zoom_start(e);

      if (!this.selectionRect.visible()) return;

      x2 = this.stage.getRelativePointerPosition().x;
      y2 = this.stage.getRelativePointerPosition().y;
      this.selectionRect.setAttrs({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      });
    });

    this.stage.on("mouseup touchend", (e) => {
      if (!this.isTouch) this.stage.draggable(e.evt.button === 1);
      else this._pinch_zoom_stop(e);

      if (!this.selectionRect.visible()) return;

      setTimeout(() => this.selectionRect.visible(false));

      const shapes = this.stage.find(".image, .video");
      const box = this.selectionRect.getClientRect();
      const selected = shapes.filter((shape) => {
        if (Konva.Util.haveIntersection(box, shape.getClientRect()))
          return shape;
      });
      this.selectedShape = selected;
      this.mainTransformer.nodes(selected);
    });

    this.stage.on("click tap", (e) => {
      if (this.selectionRect.visible()) return;

      if (e.target === this.stage) {
        this.mainTransformer.nodes([]);
        return;
      }

      // if (!e.target.hasName("image")) return;

      const metaPressed = e.evt.shiftKey || e.evt.ctr1lKey || e.evt.metaKey;
      const isSelected = this.mainTransformer.nodes().indexOf(e.target) >= 0;
      this.selectedShape = [e.target];

      if (!metaPressed && !isSelected) {
        this.mainTransformer.nodes([e.target]);
      } else if (metaPressed && isSelected) {
        const nodes = this.mainTransformer.nodes().slice();
        nodes.splice(nodes.indexOf(e.target), 1);
        this.mainTransformer.nodes(nodes);
      } else if (metaPressed && !isSelected) {
        const nodes = this.mainTransformer.nodes().concat([e.target]);
        this.mainTransformer.nodes(nodes);
      }
    });
  }

  _wheel_zoom(e, self) {
    e.evt.preventDefault();
    const oldScale = self.stage.scaleX();
    const pointer = self.stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - self.stage.x()) / oldScale,
      y: (pointer.y - self.stage.y()) / oldScale,
    };
    const cur_scaleBy = self.multScale ? self.scaleBy * 1.5 : self.scaleBy;
    const newScale =
      e.evt.deltaY > 0 ? oldScale / cur_scaleBy : oldScale * cur_scaleBy;
    self.stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    self.stage.position(newPos);
  }

  _pinch_zoom_start(e) {
    e.evt.preventDefault();
    let touch1 = e.evt.touches[0];
    let touch2 = e.evt.touches[1];
    if (touch1 && touch2) {
      if (this.stage.isDragging()) {
        this.stage.stopDrag();
      }
      let p1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      let p2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };
      if (!this.lastCenter) {
        this.lastCenter = getCenter(p1, p2);
        return;
      }
      let newCenter = getCenter(p1, p2);
      let dist = getDistance(p1, p2);
      if (!this.lastDist) {
        this.lastDist = dist;
      }
      let pointTo = {
        x: (newCenter.x - this.stage.x()) / this.stage.scaleX(),
        y: (newCenter.y - this.stage.y()) / this.stage.scaleX(),
      };
      let scale = this.stage.scaleX() * (dist / this.lastDist);
      this.stage.scaleX(scale);
      this.stage.scaleY(scale);
      let dx = newCenter.x - this.lastCenter.x;
      let dy = newCenter.y - this.lastCenter.y;
      let newPos = {
        x: newCenter.x - pointTo.x * scale + dx,
        y: newCenter.y - pointTo.y * scale + dy,
      };
      this.stage.position(newPos);
      this.lastDist = dist;
      this.lastCenter = newCenter;
    }
  }

  _pinch_zoom_stop(e) {
    this.lastDist = 0;
    this.lastCenter = null;
  }

  /////////////// Window and Stage events ///////////////

  _init_events() {
    // Register key-hold eventListeners
    if (!this.isTouch) {
      $(document).on("keyup keydown", (e) => {
        this.multScale = e.shiftKey;
        this.rotateFree = e.ctrlKey;
        // this.guidesAct = e.ctrlKey;

        if (e.type === "keydown") {
          if (e.key === "r") {
            this.rotateAct = !this.rotateAct;
            this.toggle_rotation();
          }

          if (e.key === "d" && e.ctrlKey) {
            e.preventDefault();
            this.duplicate_selected();
          }

          if (e.key === "g") {
            this.guidesAct = !this.guidesAct;
            if (!this.guidesAct) this._remove_guides();
          }
        }

        if (e.key === "Backspace") this.delete_selected();
        if (this.topLayer !== undefined) this.toggle_rotation();
      });
    }

    $(window).on("dragover", (e) => {
      e.preventDefault();
      $(".dropzone").addClass("active");
    });

    $(window).on("dragleave", (e) => {
      if (e.originalEvent.pageX != 0 || e.originalEvent.pageY != 0) {
        return false;
      }
      $(".dropzone").removeClass("active");
    });

    // Jquery doesn't provide 'e.DataTransfer'
    window.addEventListener("drop", (e) => {
      this.lastPointerPos = { x: e.pageX, y: e.pageY };
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      $(".dropzone").removeClass("active");

      if (file) {
        const type = file.type.slice(0, 5);
        if (type === "video" || type === "image") {
          this.file_2_url(file, type);
        }
      } else {
        let content = $(e.dataTransfer.getData("text/html"));
        if (content.attr("src")) {
          this.add_media(content.attr("src"), "image");
          return;
        }

        content = e.dataTransfer.getData("text");
        this.url_2_canvas(content);
      }
    });

    $(window).on("resize", (e) => this.fit_stage());

    this.topLayer.on("dragmove", (e) => {
      if (!this.guidesAct) return;

      // clear all previous lines on the screen
      this.topLayer.find(".guid-line").forEach((l) => l.destroy());

      // find possible snapping lines
      var lineGuideStops = this._getLineGuideStops(e.target);
      // find snapping points of current object
      var itemBounds = getObjectSnappingEdges(e.target);

      // now find where can we snap current object
      var guides = getGuides(lineGuideStops, itemBounds, this.guideOffset);

      // do nothing of no snapping
      if (!guides.length) {
        return;
      }

      this._drawGuides(guides);

      var absPos = e.target.absolutePosition();
      // now force object position
      guides.forEach((lg) => {
        switch (lg.snap) {
          case "start": {
            switch (lg.orientation) {
              case "V": {
                absPos.x = lg.lineGuide + lg.offset;
                break;
              }
              case "H": {
                absPos.y = lg.lineGuide + lg.offset;
                break;
              }
            }
            break;
          }
          case "center": {
            switch (lg.orientation) {
              case "V": {
                absPos.x = lg.lineGuide + lg.offset;
                break;
              }
              case "H": {
                absPos.y = lg.lineGuide + lg.offset;
                break;
              }
            }
            break;
          }
          case "end": {
            switch (lg.orientation) {
              case "V": {
                absPos.x = lg.lineGuide + lg.offset;
                break;
              }
              case "H": {
                absPos.y = lg.lineGuide + lg.offset;
                break;
              }
            }
            break;
          }
        }
      });
      e.target.absolutePosition(absPos);
    });

    this.topLayer.on("dragend", (e) => {
      this._remove_guides();
    });

    // DEBUG
    // $(window).on("click", () => {
    //   const shapes = this.stage.find(".image, .video");
    //   const selected = shapes.filter((shape) => {
    //       console.log(shape);
    //   });
    // });

    // this.stage.on("dblclick", () => console.log("hi"))
  }

  /////////////// Helper methods ///////////////

  _remove_guides() {
    // clear all previous lines on the screen
    this.topLayer.find(".guid-line").forEach((l) => l.destroy());
  }

  _get_ratio(layerSize) {
    const hRatio = this.stage.width() / layerSize.w;
    const vRatio = this.stage.height() / layerSize.h;
    return Math.min(hRatio, vRatio) * 0.85;
  }

  _get_scaled_size(layerSize) {
    const too_big =
      layerSize.h > $(window).height() || layerSize.w > $(window).width();
    const ratio = too_big ? this._get_ratio(layerSize) : 1;

    return {
      w: layerSize.w * ratio,
      h: layerSize.h * ratio,
    };
  }

  _getLineGuideStops(skipShape) {
    // were can we snap our objects?
    // we can snap to stage borders and the center of the stage
    var vertical = [0, this.stage.width() / 2, this.stage.width()];
    var horizontal = [0, this.stage.height() / 2, this.stage.height()];

    // and we snap over edges and center of each object on the canvas
    this.stage.find(".image, .video").forEach((guideItem) => {
      if (guideItem === skipShape) {
        return;
      }
      var box = guideItem.getClientRect();
      // and we can snap to all edges of shapes
      vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
      horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
    });
    return {
      vertical: vertical.flat(),
      horizontal: horizontal.flat(),
    };
  }

  _drawGuides(guides) {
    guides.forEach((lg) => {
      if (lg.orientation === "H") {
        var line = new Konva.Line({
          points: [-6000, 0, 6000, 0],
          stroke: "rgb(0, 161, 255)",
          strokeWidth: 1,
          name: "guid-line",
          dash: [4, 6],
        });
        this.topLayer.add(line);
        line.absolutePosition({
          x: 0,
          y: lg.lineGuide,
        });
      } else if (lg.orientation === "V") {
        var line = new Konva.Line({
          points: [0, -6000, 0, 6000],
          stroke: "rgb(0, 161, 255)",
          strokeWidth: 1,
          name: "guid-line",
          dash: [4, 6],
        });
        this.topLayer.add(line);
        line.absolutePosition({
          x: lg.lineGuide,
          y: 0,
        });
      }
    });
  }
}

export { StageSingleton };

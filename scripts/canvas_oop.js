import { isTouchDevice } from "./helpers.js";

const getRatio = (stage, img) => {
  const hRatio = stage.width() / img.width;
  const vRatio = stage.height() / img.height;
  return Math.min(hRatio, vRatio) * 0.85;
};

const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getCenter = (p1, p2) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
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

    this.stage.add(this.topLayer);
    this.topLayer.add(this.mainTransformer);
    this.topLayer.add(this.selectionRect);
    this.isTouch = isTouchDevice();

    // Configuration variables
    this.scaleBy = 1.01;
    this.multScale = false;
    this.rotateAct = false;
    this.rotateFree = false;
    this.stageDrag = false;
    this.selectedShape;
    this.lastPointerPos;

    // Zoom variables
    this.lastDist = 0;
    this.lastCenter;

    this._init_select_zoom();
    this._init_events();
  }

  add_img(url) {
    const imageObj = new Image();
    imageObj.src = url;
    imageObj.onload = () => {
      const too_big =
        imageObj.height > $(window).height() ||
        imageObj.width > $(window).width();
      const ratio = too_big ? getRatio(this.stage, imageObj) : 1;

      const pos = this.stage.getPointerPosition();
      const img_width = imageObj.width * ratio;
      const img_height = imageObj.height * ratio;
      const imageLayer = new Konva.Image({
        x: this.lastPointerPos.x - img_width / 2,
        y: this.lastPointerPos.y - img_height / 2,
        image: imageObj,
        width: img_width,
        height: img_height,
        name: "image",
        draggable: true,
      });
      this.topLayer.add(imageLayer);
      this.mainTransformer.nodes([imageLayer]);
      this.mainTransformer.moveToTop();
    };
  }

  file_2_img(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.add_img(reader.result);
  }

  toggle_rotation() {
    this.mainTransformer.rotationSnapTolerance(this.rotateFree ? 0 : 5);
    this.mainTransformer.resizeEnabled(this.rotateAct ? false : true);
    this.mainTransformer.rotateEnabled(!this.rotateAct ? false : true);
  }

  delete_selected() {
    if (this.selectedShape === undefined) return;

    for (let shape of this.selectedShape) shape.destroy();
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

  fit_stage() {
    this.stage.width($(window).width());
    this.stage.height($(window).height());
  }

  // Zoom and selection eventListeners
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

      const shapes = this.stage.find(".image");
      const box = this.selectionRect.getClientRect();
      const selected = shapes.filter((shape) => {
        if (Konva.Util.haveIntersection(box, shape.getClientRect()))
          return shape;
      });
      this.selectedShape = selected;
      this.mainTransformer.nodes(selected);
    });

    this.stage.on("click tap", (e) => {

      console.log(e.target)
      if (this.selectionRect.visible()) return;

      if (e.target === this.stage) {
        this.mainTransformer.nodes([]);
        return;
      }

      if (!e.target.hasName("image")) return;

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
    // console.log(this.scaleX());
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

  // Window events
  _init_events() {
    // Register key-hold eventListeners
    if (!this.isTouch) {
      $(document).on("keyup keydown", (e) => {
        this.multScale = e.shiftKey;
        this.rotateFree = e.ctrlKey;

        if (e.key === "r" && e.type === "keydown") {
          this.rotateAct = !this.rotateAct;
          this.toggle_rotation();
        }

        if (e.key === "Backspace") this.delete_selected();
        if (this.topLayer !== undefined) this.toggle_rotation();
      });
    }

    $(window).on("dragover", (e) => {
      e.preventDefault();
    });

    // Jquery doesn't provide 'e.DataTransfer'
    window.addEventListener("drop", (e) => {
      this.lastPointerPos = { x: e.pageX, y: e.pageY };
      e.preventDefault();
      const file = e.dataTransfer.files[0];

      if (file) {
        if (file.type.startsWith("image/")) {
          this.file_2_canvas(file);
        }
      } else {
        const content = $(e.dataTransfer.getData("text/html"));
        if (content.attr("src")) {
          this.add_img(content.attr("src"));
        }
      }
    });

    $(window).on("resize", (e) => this.fit_stage());
  }
}

export { StageSingleton };

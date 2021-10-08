import { isTouchDevice, getDistance, getCenter } from "./helpers.js";

// CONFIGURE STAGE
let StageConfig = {
    Stage: undefined,
    TopLayer: undefined,
    SelectionRect: undefined,
    TransMain: undefined
}

let Config = {
    scaleBy: 1.01,
    multScale: false,
    rotateAct: false,
    rotateFree: false,
    curShapes: undefined,
    lastAnchor: undefined
}

var isTouch = isTouchDevice();


const get_stage = () => {
    if (StageConfig.Stage === undefined) {
        StageConfig.Stage = new Konva.Stage({
            container: "container",
            width: $(window).width(),
            height: $(window).height(),
        });
        StageConfig.TopLayer = new Konva.Layer();
        StageConfig.Stage.add(StageConfig.TopLayer);
        StageConfig.SelectionRect = new Konva.Rect({
            fill: 'rgba(0,0,255,0.5)',
            visible: false,
        });
        StageConfig.TransMain = new Konva.Transformer({
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
        StageConfig.TopLayer.add(StageConfig.TransMain);
    }
    return [StageConfig.Stage, StageConfig.TopLayer, StageConfig.SelectionRect];
};

const add_img = (link) => {
    let [stage, layer, selectionRectangle] = get_stage();
    layer.add(selectionRectangle);
    let imageObj = new Image();
    imageObj.src = link;
    imageObj.onload = () => {
        let img = new Konva.Image({
            x: 50,
            y: 50,
            image: imageObj,
            width: imageObj.width,
            height: imageObj.height,
            name: "image",
            draggable: true
        });
        layer.add(img);
        StageConfig.TransMain.nodes([img]);
        StageConfig.TransMain.moveToTop();
        add_select_zoom(stage, StageConfig.TransMain, selectionRectangle);
    };
};

const add_select_zoom = (stage, transform, selectionRectangle) => {
    if (!isTouch)
        stage.on("wheel", stage_wheel_zoom);
    let x1, y1, x2, y2;
    stage.on('mousedown touchstart', (e) => {
        if (!isTouch) {
            stage.draggable(e.evt.button === 1 || e.evt.altKey);
        }
        if (e.target !== stage) {
            return;
        }
        x1 = x2 = stage.getRelativePointerPosition().x;
        y1 = y2 = stage.getRelativePointerPosition().y;
        selectionRectangle.visible(true);
        selectionRectangle.width(0);
        selectionRectangle.height(0);
    });
    stage.on('mousemove touchmove', (e) => {
        if (isTouch)
            pinch_zoom_start(e);
        if (!selectionRectangle.visible()) {
            return;
        }
        x2 = stage.getRelativePointerPosition().x;
        y2 = stage.getRelativePointerPosition().y;
        selectionRectangle.setAttrs({
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
        });
    });
    stage.on('mouseup touchend', (e) => {
        if (!isTouch) {
            stage.draggable(e.evt.button === 1);
        }
        else {
            pinch_zoom_stop(e);
        }
        if (!selectionRectangle.visible()) {
            return;
        }
        setTimeout(() => {
            selectionRectangle.visible(false);
        });
        const shapes = stage.find('.image');
        const box = selectionRectangle.getClientRect();
        const selected = shapes.filter((shape) => {
            if (Konva.Util.haveIntersection(box, shape.getClientRect()))
                return shape;
        });
        Config.curShapes = selected;
        transform.nodes(selected);
    });
    stage.on('click tap', function (e) {
        if (selectionRectangle.visible()) {
            return;
        }
        if (e.target === stage) {
            transform.nodes([]);
            return;
        }
        if (!e.target.hasName('image')) {
            return;
        }
        const metaPressed = e.evt.shiftKey || e.evt.ctr1lKey || e.evt.metaKey;
        const isSelected = transform.nodes().indexOf(e.target) >= 0;
        Config.curShapes = [e.target];
        if (!metaPressed && !isSelected) {
            transform.nodes([e.target]);
        }
        else if (metaPressed && isSelected) {
            const nodes = transform.nodes().slice();
            nodes.splice(nodes.indexOf(e.target), 1);
            transform.nodes(nodes);
        }
        else if (metaPressed && !isSelected) {
            const nodes = transform.nodes().concat([e.target]);
            transform.nodes(nodes);
        }
    });
};

const toggle_rotation = () => {
    StageConfig.TransMain.rotationSnapTolerance(Config.rotateFree ? 0 : 5)
    StageConfig.TransMain.resizeEnabled(Config.rotateAct ? false : true);
    StageConfig.TransMain.rotateEnabled(!Config.rotateAct ? false : true);
};

const toggle_transformation = (state) => {
    StageConfig.TransMain.resizeEnabled(state)
}

const delete_selected = () => {
    if (Config.curShapes === undefined) return

    for (let shape of Config.curShapes) {
        shape.destroy();
    }
    StageConfig.TopLayer.draw();
};

const moveTT_selected = () => {
    if (Config.curShapes !== undefined && Config.curShapes.length){
        const shape = Config.curShapes[0]
        shape.moveToTop()
        StageConfig.TransMain.moveToTop()
    }
}

const file_2_canvas = file => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
        add_img(reader.result)
    }
}

function fit_stage() {
    if (StageConfig.Stage === undefined) return

    const sceneWidth = $(window).width()
    const sceneHeight = $(window).height()
    StageConfig.Stage.width(sceneWidth)
    StageConfig.Stage.height(sceneHeight)
  }


// DESKTOP ZOOMING (Mouse wheel)
const stage_wheel_zoom = (e) => {
    e.evt.preventDefault();
    const oldScale = StageConfig.Stage.scaleX();
    const pointer = StageConfig.Stage.getPointerPosition();
    const mousePointTo = {
        x: (pointer.x - StageConfig.Stage.x()) / oldScale,
        y: (pointer.y - StageConfig.Stage.y()) / oldScale,
    };
    // const cur_scaleBy = multScale ? scaleBy * 1.5 : scaleBy;
    const cur_scaleBy = Config.multScale ? Config.scaleBy * 1.5 : Config.scaleBy;
    const newScale = e.evt.deltaY > 0 ? oldScale / cur_scaleBy : oldScale * cur_scaleBy;
    StageConfig.Stage.scale({ x: newScale, y: newScale });
    const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    };
    StageConfig.Stage.position(newPos);
};


// TOUCH ZOOMING (Pinch Zoom)
var lastDist = 0;
var lastCenter = null;
const pinch_zoom_start = (e) => {
    e.evt.preventDefault();
    let touch1 = e.evt.touches[0];
    let touch2 = e.evt.touches[1];
    if (touch1 && touch2) {
        if (StageConfig.Stage.isDragging()) {
            StageConfig.Stage.stopDrag();
        }
        let p1 = {
            x: touch1.clientX,
            y: touch1.clientY,
        };
        let p2 = {
            x: touch2.clientX,
            y: touch2.clientY,
        };
        if (!lastCenter) {
            lastCenter = getCenter(p1, p2);
            return;
        }
        let newCenter = getCenter(p1, p2);
        let dist = getDistance(p1, p2);
        if (!lastDist) {
            lastDist = dist;
        }
        let pointTo = {
            x: (newCenter.x - StageConfig.Stage.x()) / StageConfig.Stage.scaleX(),
            y: (newCenter.y - StageConfig.Stage.y()) / StageConfig.Stage.scaleX(),
        };
        let scale = StageConfig.Stage.scaleX() * (dist / lastDist);
        StageConfig.Stage.scaleX(scale);
        StageConfig.Stage.scaleY(scale);
        let dx = newCenter.x - lastCenter.x;
        let dy = newCenter.y - lastCenter.y;
        let newPos = {
            x: newCenter.x - pointTo.x * scale + dx,
            y: newCenter.y - pointTo.y * scale + dy,
        };
        StageConfig.Stage.position(newPos);
        lastDist = dist;
        lastCenter = newCenter;
    }
};
const pinch_zoom_stop = (e) => {
    lastDist = 0;
    lastCenter = null;
};


export {add_img, toggle_rotation, delete_selected, moveTT_selected, 
        file_2_canvas, toggle_transformation, fit_stage}
export {isTouch, Config, StageConfig}
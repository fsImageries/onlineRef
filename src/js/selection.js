import React from "react";

const updateSelectionRect = (selectionRectRef, selection) => {
  const node = selectionRectRef.current;
  node.setAttrs({
    visible: selection.current.visible,
    x: Math.min(selection.current.x1, selection.current.x2),
    y: Math.min(selection.current.y1, selection.current.y2),
    width: Math.abs(selection.current.x1 - selection.current.x2),
    height: Math.abs(selection.current.y1 - selection.current.y2),
    fill: "rgba(0, 161, 255, 0.3)",
  });
  node.getLayer().batchDraw();
};

const checkDeselect = (e, trRef, selectShape, setNodes) => {
  // deselect when clicked on empty area
  const clickedOnEmpty = e.target === e.target.getStage();
  if (clickedOnEmpty) {
    selectShape(null);
    trRef.current.nodes([]);
    setNodes([]);
    // layerRef.current.remove(selectionRectangle);
  }
};

const onMouseDown = (e, selection, selectionRectRef) => {
  const isElement = e.target.findAncestor(".elements-container");
  const isTransformer = e.target.findAncestor("Transformer");
  if (isElement || isTransformer) {
    return;
  }

  const pos = e.target.getStage().getPointerPosition();
  selection.current.visible = true;
  selection.current.x1 = pos.x;
  selection.current.y1 = pos.y;
  selection.current.x2 = pos.x;
  selection.current.y2 = pos.y;
  updateSelectionRect(selectionRectRef, selection);
};

const onMouseMove = (e, selection, selectionRectRef) => {
  if (!selection.current.visible) {
    return;
  }
  const pos = e.target.getStage().getPointerPosition();
  selection.current.x2 = pos.x;
  selection.current.y2 = pos.y;
  updateSelectionRect(selectionRectRef, selection);
};

const onMouseUp = (trRef, layerRef, selectionRectRef, selection, Konva) => {
  //   oldPos.current = null;
  if (!selection.current.visible) {
    return;
  }
  const selBox = selectionRectRef.current.getClientRect();

  const elements = [];
  layerRef.current.find(".image, .video").forEach((elementNode) => {
    const elBox = elementNode.getClientRect();
    // console.log(elBox);
    if (Konva.Util.haveIntersection(selBox, elBox)) {
      elements.push(elementNode);
    }
  });
  trRef.current.nodes(elements);
  selection.current.visible = false;
  // disable click event
  Konva.listenClickTap = false;
  updateSelectionRect(selectionRectRef, selection);
};

const onClickTap = (e, layerRef, trRef, selectShape, setNodes) => {
  // if we are selecting with rect, do nothing
  //   if (selectionRectangle.visible()) {
  //     return;
  //   }
  let stage = e.target.getStage();
  let layer = layerRef.current;
  let tr = trRef.current;
  // if click on empty area - remove all selections
  if (e.target === stage) {
    selectShape(null);
    setNodes([]);
    tr.nodes([]);
    layer.draw();
    return;
  }

  // do nothing if clicked NOT on our rectangles
  if (!e.target.hasName(".image, .video")) {
    return;
  }

  // do we pressed shift or ctrl?
  const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
  const isSelected = tr.nodes().indexOf(e.target) >= 0;

  if (!metaPressed && !isSelected) {
    // if no key pressed and the node is not selected
    // select just one
    tr.nodes([e.target]);
  } else if (metaPressed && isSelected) {
    // if we pressed keys and node was selected
    // we need to remove it from selection:
    const nodes = tr.nodes().slice(); // use slice to have new copy of array
    // remove node from array
    nodes.splice(nodes.indexOf(e.target), 1);
    tr.nodes(nodes);
  } else if (metaPressed && !isSelected) {
    // add the node into selection
    const nodes = tr.nodes().concat([e.target]);
    tr.nodes(nodes);
  }
  layer.draw();
};

const onLayerSelect = (e, index, trRef, nodesArray, setNodes, selectShape) => {
  if (e.current !== undefined) {
    let temp = nodesArray;
    if (!nodesArray.includes(e.current)) temp.push(e.current);
    setNodes(temp);
    trRef.current.nodes(nodesArray);
    trRef.current.nodes(nodesArray);
    trRef.current.getLayer().batchDraw();
  }
  selectShape(index);
};

const onLayerChange = (newAttrs, index, media, setMedia) => {
  const meds = media.slice();
  meds[index] = newAttrs;
  setMedia(meds);
};

export {
  checkDeselect,
  onClickTap,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onLayerSelect,
  onLayerChange,
};

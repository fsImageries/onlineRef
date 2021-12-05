// selection straight up stolen from :* :
// https://codesandbox.io/s/react-konva-multiple-selection-tgggi

const updateSelectionRect = (selectionRectRef, selection, stagePos) => {
  const node = selectionRectRef.current;
  node.setAttrs({
    visible: selection.current.visible,
    x: Math.min(selection.current.x1, selection.current.x2) - stagePos.x,
    y: Math.min(selection.current.y1, selection.current.y2) - stagePos.y,
    width: Math.abs(selection.current.x1 - selection.current.x2),
    height: Math.abs(selection.current.y1 - selection.current.y2),
    fill: "rgba(0, 161, 255, 0.3)",
  });
  node.getLayer().batchDraw();
};

const checkDeselect = (e, selection) => {
  // deselect when clicked on empty area
  const clickedOnEmpty = e.target === e.target.getStage();
  if (clickedOnEmpty) {
    selection.selectShape(null);
    selection.trRef.nodes([]);
    selection.setNodes([]);
    // layerRef.current.remove(selectionRectangle);
  }
};

const onMouseDown = (e, selection) => {
  const isElement = e.target.hasName("image");
  const isTransformer = e.target.findAncestor("Transformer");
  if (isElement || isTransformer) {
    return;
  }

  const stagePos = selection.stageRef.position();
  let pos = e.target.getStage().getRelativePointerPosition();
  pos = {
    x: pos.x + stagePos.x,
    y: pos.y + stagePos.y,
  };
  selection._curSelection.current.visible = true;
  selection._curSelection.current.x1 = pos.x;
  selection._curSelection.current.y1 = pos.y;
  selection._curSelection.current.x2 = pos.x;
  selection._curSelection.current.y2 = pos.y;
  updateSelectionRect(
    selection._selectionRectRef,
    selection._curSelection,
    stagePos
  );
};

const onMouseMove = (e, selection) => {
  if (!selection.curSelection.visible) {
    return;
  }
  const stagePos = selection.stageRef.position();
  let pos = e.target.getStage().getRelativePointerPosition();
  pos = {
    x: pos.x + stagePos.x,
    y: pos.y + stagePos.y,
  };

  selection.curSelection.x2 = pos.x;
  selection.curSelection.y2 = pos.y;
  updateSelectionRect(
    selection._selectionRectRef,
    selection._curSelection,
    stagePos
  );
};

const onMouseUp = (selection) => {
  if (!selection.curSelection.visible) {
    return;
  }
  const selBox = selection.selectionRectRef.getClientRect();

  const elements = [];
  selection.layerRef.find(".image").forEach((elementNode) => {
    const elBox = elementNode.getClientRect();
    if (Konva.Util.haveIntersection(selBox, elBox)) {
      elements.push(elementNode);
    }
  });
  selection.trRef.nodes(elements);
  selection.setNodes(selection.trRef.nodes());
  selection._curSelection.current.visible = false;
  // disable click event
  Konva.listenClickTap = false;
  updateSelectionRect(
    selection._selectionRectRef,
    selection._curSelection,
    selection.stageRef.position()
  );
};

const onClickTap = (e, selection) => {
  let stage = e.target.getStage();
  let layer = selection.layerRef;
  let tr = selection.trRef;
  // if click on empty area - remove all selections
  if (e.target === stage) {
    selection.selectShape(null);
    selection.setNodes([]);
    tr.nodes([]);
    layer.draw();
    return;
  }

  // do nothing if clicked NOT on our rectangles
  if (!e.target.hasName("image")) {
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
  selection.setNodes(tr.nodes());
  layer.draw();
};

const onLayerSelect = (e, index, trRef, nodesArray, setNodes, selectShape) => {
  // if (e.current !== undefined) {
  //   // let temp = nodesArray;
  //   // if (!nodesArray.includes(e.current)) temp.push(e.current);
  //   // setNodes(temp);
  //   setNodes([e.current]);
  //   trRef.current.nodes([e.current]);
  //   trRef.current.getLayer().batchDraw();
  // }
  // selectShape(index);
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

const wheelHandler = (e, scaleBy, setConfig) => {
  e.evt.preventDefault();

  const stage = e.target.getStage();
  const oldScale = stage.scaleX();
  const mousePointTo = {
    x: stage.getRelativePointerPosition().x / oldScale - stage.x() / oldScale,
    y: stage.getRelativePointerPosition().y / oldScale - stage.y() / oldScale,
  };

  let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
  newScale = Math.max(0.02, newScale);

  setConfig({
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

export { wheelHandler };

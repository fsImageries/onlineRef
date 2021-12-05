const GUIDELINE_OFFSET = 10;

// where can we snap our objects?
const getLineGuideStops = (skipShape, stage) => {
  // we can snap to stage borders and the center of the stage
  let vertical = [0, stage.current.width() / 2, stage.current.width()];
  let horizontal = [0, stage.current.height() / 2, stage.current.height()];

  // and we snap over edges and center of each object on the canvas
  stage.current.find(".image").forEach((guideItem) => {
    if (guideItem === skipShape) {
      return;
    }
    let box = guideItem.getClientRect();
    // and we can snap to all edges of shapes
    vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
    horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
  });
  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  };
};

// what points of the object will trigger to snapping?
// it can be just center of the object
// but we will enable all edges and center
const getObjectSnappingEdges = (node) => {
  let box = node.getClientRect();
  let absPos = node.absolutePosition();

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

// find all snapping possibilities
const getGuides = (lineGuideStops, itemBounds) => {
  let resultV = [];
  let resultH = [];

  lineGuideStops.vertical.forEach((lineGuide) => {
    itemBounds.vertical.forEach((itemBound) => {
      let diff = Math.abs(lineGuide - itemBound.guide);
      // if the distance between guild line and object snap point is close we can consider this for snapping
      if (diff < GUIDELINE_OFFSET) {
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
      let diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < GUIDELINE_OFFSET) {
        resultH.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  let guides = [];

  // find closest snap
  let minV = resultV.sort((a, b) => a.diff - b.diff)[0];
  let minH = resultH.sort((a, b) => a.diff - b.diff)[0];
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

const drawGuides = (guides, setGuides, showGuides) => {
const strokeCol = showGuides ? "rgb(0, 161, 255)" : "rgba(0, 161, 255, 0)" 
  if (guides) {
    guides.forEach((lg) => {
      if (lg.orientation === "H") {
        let guide = {
          points: [-6000, 0, 6000, 0],
          stroke: strokeCol,
          strokeWidth: 1,
          name: "guid-line",
          dash: [4, 6],
          x: 0,
          y: lg.lineGuide,
        };
        setGuides([...guides, guide]);
      } else if (lg.orientation === "V") {
        let guide = {
          points: [0, -6000, 0, 6000],
          stroke: strokeCol,
          strokeWidth: 1,
          name: "guid-line",
          dash: [4, 6],
          x: lg.lineGuide,
          y: 0,
        };
        setGuides([...guides, guide]);
      }
    });
  }
};

const onDragMove = (e, stage, setGuides, showGuides) => {
  // clear all previous lines on the screen
  // layer.find('.guid-line').destroy();

  // find possible snapping lines
  let lineGuideStops = getLineGuideStops(e.target, stage);
  // find snapping points of current object
  let itemBounds = getObjectSnappingEdges(e.target);

  // now find where can we snap current object
  let guides = getGuides(lineGuideStops, itemBounds);

  // do nothing of no snapping
  if (!guides.length) {
    return;
  }

  drawGuides(guides, setGuides, showGuides);

  let absPos = e.target.absolutePosition();
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
          default:
            break;
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
          default:
            break;
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
          default:
            break;
        }
        break;
      }
      default:
        break;
    }
  });
  e.target.absolutePosition(absPos);
};

const onDragEnd = (e, setGuides) => {
  setGuides([]);
};


export {onDragMove, onDragEnd}
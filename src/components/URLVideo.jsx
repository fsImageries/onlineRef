import React, { useRef, useEffect, useReducer } from "react";
import { Image } from "react-konva";
import Konva from "konva";

import VideoButton from "components/VideoButton";

const playReducer = (_, action) => {
  switch (action.type) {
    case "pause": {
      action.video.pause();
      return false;
    }
    case "play": {
      action.video.play();
      return true;
    }
  }
};

const URLVideo = ({ imageProps, onChange, idx }) => {
  const videoRef = useRef();

  // use Konva.Animation to redraw a layer
  useEffect(() => {
    imageProps.image.play();
    const layer = videoRef.current.getLayer();

    const anim = new Konva.Animation(() => {}, layer);
    anim.start();
    imageProps.image.pause();

    return () => anim.stop();
  }, [imageProps.image]);

  const [isPlaying, playDispatch] = useReducer(playReducer, false);
  const setPlaying = (action) => {
    action = { ...action, video: imageProps.image };
    playDispatch(action);
  };

  const transformHandler = (e) => {
    // transformer is changing scale of the node
    // and NOT its width or height
    // but in the store we have only width and height
    // to match the data better we will reset scale on transform end
    const node = videoRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // we will reset it back
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      ...imageProps,
      src: imageProps.src,
      x: node.x(),
      y: node.y(),
      // set minimal value
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(node.height() * scaleY),
    });
  };

  return (
    <>
      <Image
        {...imageProps}
        draggable
        name={"image"}
        ref={videoRef}
        onMouseOver={() => setPlaying({ type: "play" })}
        onMouseLeave={() => setPlaying({ type: "pause" })}
        // Needed for selection and transformation of the image
        // just disable video buttons while dragging, idiot
        onDragMove={(e) => {
          onChange({
            ...imageProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) => {
          onChange({
            ...imageProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        // onTransform={transformHandler}
        onTransformEnd={transformHandler}
      ></Image>
      <VideoButton props={imageProps} isPlaying={isPlaying} />
    </>
  );
};

export default URLVideo;

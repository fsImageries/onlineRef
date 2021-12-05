import React, { useLayoutEffect, useRef } from "react";
import { RegularPolygon, Line, Group } from "react-konva";
import $ from "jquery";
import { gsap } from "gsap";

const VideoButton = ({ props, isPlaying, setPlaying }) => {
  const shapeRef = useRef();

  const iconHeight = (props.height / 100) * 5;
  const groundPush = iconHeight / 2;

  const clickHandler = () => {
    setPlaying({ type: isPlaying ? "pause" : "play" })
  };

  // isPlaying = true
  const return_comp = () => {
    if (isPlaying) {
      const n = 3;
      const a = iconHeight;
      const csc = (x) => 1 / Math.sin(x);
      const r = (1 / 2) * a * csc(Math.PI / n); // 1/2acsc(pi/n)

      return (
        <RegularPolygon
          ref={shapeRef}
          x={props.x + props.width / 2}
          y={props.y + props.height - a / 2 - groundPush}
          rotation={90}
          sides={n}
          radius={r}
          fill={$(":root").css("--btn-fill")}
          opacity={0}
          onClick={clickHandler}
        ></RegularPolygon>
      );
    } else {
      const p1 = props.x + props.width / 2;
      const p2 = props.y + props.height - groundPush;
      const push = (iconHeight / 10) * 2;

      const lines = [0, 1].map((idx) => {
        const tmp1 = idx === 0 ? p1 - push : p1 + push;
        return [tmp1, p2, tmp1, p2 - iconHeight];
      });

      return (
        <Group ref={shapeRef} opacity={0} onClick={clickHandler}>
          {lines.map((points, idx) => (
            <Line
              key={idx}
              points={points}
              // stroke={"red"}
              stroke={$(":root").css("--btn-fill")}
              strokeWidth={iconHeight / 10}
            ></Line>
          ))}
        </Group>
      );
    }
  };

  useLayoutEffect(() => {
    const duration = 1.5;
    const tl = new gsap.timeline();

    tl.to(shapeRef.current, {
      onComplete: () => tl.reverse(),
      duration: duration,
      opacity: 0.35,
      ease: "power2.inOut",
    });
  }, [isPlaying]);

  return return_comp();
};

export default VideoButton;

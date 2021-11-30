import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import * as helper from "js/helper";

const SettingsMenu = ({ controller, funcs, states }) => {
  const settings = [
    ["Stage Background Color", "color"],
    ["Show Guides", "checkbox"],
  ];

  const footerFuncs = funcs.slice(0, 2);
  funcs = funcs.slice(2, funcs.length);

  const [isOpen, setOpen] = useState(false);
  controller.current.isOpen = isOpen;
  controller.current.setOpen = setOpen;
  const mainRef = useRef();
  //   const categories = [["General", true]];

  useLayoutEffect(() => {
    const tl = gsap.timeline({ paused: true });

    const fx = {
      ease: "Expo.easeOut",
      duration: 1,
      width: 0,
    };

    tl.from(mainRef.current, fx);

    controller.current.main = tl;

    controller.current.anim = (force = null) => {
      const newOpen = force === null ? !isOpen : force;
      setOpen(newOpen);
      if (newOpen) {
        controller.current.main.play();
        return;
      }
      controller.current.main.reverse();
    };

    const closeField = (e) => {
      const key_check = e.type === "keydown" && e.key === "Escape";
      const click_check =
        !e.target.closest(".settingsMenu") &&
        !tl.paused() &&
        !!tl.totalProgress();

      if (key_check || click_check) {
        controller.current.anim(false);
      }
    };

    const handlers = (del = false) => {
      "click tap keydown".split(" ").forEach((elem) => {
        window[del ? "removeEventListener" : "addEventListener"](elem, (e) =>
          closeField(e)
        );
      });
    };

    handlers();

    return () => handlers(false);
  }, []);

  return (
    <div className="mainWrapper" ref={mainRef}>
      <div className="settingsMenu">
        <div className="innerMenu">
          <table width="100%">
            {settings.map(([label, type], i) => {
              return (
                <tbody key={i}>
                  <tr>
                    <td>
                      <label htmlFor={`input${i}`}>{label}</label>
                    </td>
                    <td>
                      <div>
                        <input
                          {...(type === "checkbox" && { checked: states[i] })}
                          id={`input${i}`}
                          type={type}
                          // checked={states[i]}
                          // defaultChecked={type === "checkbox" && states[i]}
                          onChange={(e) => funcs[i](e)}
                        />
                        {type === "color" && (
                          <div className="colorSwatch"></div>
                        )}
                        <span></span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              );
            })}
            <tfoot>
              <tr>
                <td colSpan="2">
                  <input
                    type="submit"
                    value="Save Settings"
                    onClick={footerFuncs[0]}
                  />
                  <input
                    type="submit"
                    value="Reset Settings"
                    onClick={footerFuncs[1]}
                  />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;

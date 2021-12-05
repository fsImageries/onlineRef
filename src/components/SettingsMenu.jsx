import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import $ from "jquery";

import * as helper from "src/js/helper";
import {useController} from "src/js/controllers"
import { useStoredConfig } from "src/states/storedConfig";


const SettingsMenu = () => {
  const settings = [
    ["Stage Background Color", "color", "stageBg"],
    ["Show Guides", "checkbox", "showGuides"],
  ];

  const [isOpen, setOpen] = useState(false);
  const mainRef = useRef();

  const stored = useStoredConfig();
  const controller = useController()

  const settingsFuncs = [
    (e) => {
      stored.reset();
    },
    (e) => {
      stored.setStageBg(helper.hex2rgb(e.target.value))
    },
    (e) => {
      stored.setShowGuides(e.target.checked);
    },
  ];

  useLayoutEffect(() => {
    const tl = gsap.timeline({ paused: true });

    const fx = {
      ease: "Expo.easeOut",
      duration: 1,
      width: 0,
    };

    tl.from(mainRef.current, fx);
    controller.con._tl = tl;

    controller.con.anim = (force = null) => {
      const newOpen = force === null ? !isOpen : force;
      setOpen(newOpen);
      if (newOpen) {
        controller.con._tl.play();
        return;
      }
      controller.con._tl.reverse();
    };

    const closeField = (e) => {
      const key_check = e.type === "keydown" && e.key === "Escape";
      const click_check =
        !e.target.closest(".settingsMenu") &&
        !tl.paused() &&
        !!tl.totalProgress();

      if (key_check || click_check) {
        controller.con.anim(false);
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
            {settings.map(([label, type, attr], i) => {
              return (
                <tbody key={i}>
                  <tr>
                    <td>
                      <label htmlFor={`input${i}`}>{label}</label>
                    </td>
                    <td>
                      <div>
                        <input
                          checked={type === "checkbox" ? stored[attr] : false}
                          id={`input${i}`}
                          type={type}
                          onChange={(e) => settingsFuncs[i+1](e)}
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
                  {/* <input
                    type="submit"
                    value="Save Settings"
                    onClick={settingsFuncs[0]}
                  /> */}
                  <input
                    type="submit"
                    value="Reset Settings"
                    onClick={settingsFuncs[0]}
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

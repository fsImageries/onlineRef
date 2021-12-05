import {useState, useRef} from "react"

const componentToHex = (c) => {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

const rgb2Hex = (r, g, b) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

const hex2rgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
};

const getStoredSettings = (key = null) => {
  const obj = JSON.parse(localStorage.getItem("settings"));

  if (obj !== undefined) return key !== null ? obj[key] : obj;
  else return null;
};

const setStoredSettings = (settings) => {
  const entry = JSON.stringify(settings);
  localStorage.setItem("settings", entry);
};

const download = (data, fileName, contentType = "text/plain") => {
  let a = document.createElement("a");
  let file = new Blob([data], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

const get_jsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onerror = reject;
    reader.onload = () => resolve(JSON.parse(reader.result));
  });
};

const isVideoPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);

//* Custom Hooks

const useEffectState = (init) => {
  const [state, _setState] = useState(init);
  const stateRef = useRef(state);
  const setState = (data) => {
    stateRef.current = data;
    _setState(data);
  };

  return [stateRef, setState];
};

export {
  hex2rgb,
  rgb2Hex,
  getStoredSettings,
  setStoredSettings,
  download,
  get_jsonFile,
  isVideoPlaying,
  useEffectState
};

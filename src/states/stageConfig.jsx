import React, { useContext } from "react";

import { useEffectState } from "src/js/helper";

class StageConfig {
  constructor(defaults = null) {
    if (defaults === null) {
      defaults = {
        scaleX: 1,
        scaleY: 1,
        width: window.innerWidth,
        height: window.innerHeight,
        x: 0,
        y: 0,
      };
    }

    const [config, setConfig] = useEffectState(defaults);

    this._config = config;
    this.setConfig = setConfig;
  }

  get config() {
    return this._config.current;
  }

  get scale() {
    return this.config.scaleX;
  }

  get pos() {
    return [this.config.x, this.config.y];
  }

  get dims() {
    return [this.config.width, this.config.height];
  }

  addConfig(inConfig) {
    this.setConfig({
      ...this.config,
      ...inConfig,
    });
  }

  setDims([width, height]) {
    this.setConfig({
      ...this.config,
      width: width,
      height: height,
    });
  }

  setPos([x, y]) {
    this.setConfig({
      ...this.config,
      x: x,
      y: y,
    });
  }

  setScale(newScale) {
    this.setConfig({
      ...this.config,
      scaleX: newScale,
      scaleY: newScale,
    });
  }
}

const StageConfigContext = React.createContext();
const StageConfigProvider = ({ value, children }) => {
  return (
    <StageConfigContext.Provider value={value}>
      {children}
    </StageConfigContext.Provider>
  );
};

const useStageConfig = () => {
  return useContext(StageConfigContext);
};

export { StageConfig, StageConfigProvider, useStageConfig };

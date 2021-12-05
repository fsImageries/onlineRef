import React, { useRef, useContext } from "react";

class DefaultController {
  constructor() {
    this._controller = useRef(this.getDefaults());
  }

  getDefaults() {
    return {
      anim: null,
    };
  }

  get con() {
    return this._controller.current;
  }
}

class SettingsMenuController extends DefaultController {
  getDefaults() {
    return {
      anim: null,
      _tl: null,
    };
  }
}

class LinkFieldController extends DefaultController {
  getDefaults() {
    return {
      anim: null,
      svgTl: null,
      input: null,
      callback: null,
      setActive: null,
      isActive: null,
    };
  }
}

class DropZoneController extends DefaultController {
  getDefaults() {
    return {
      anim: null,
      right: null,
      left: null,
    };
  }
}

const ControllerContext = React.createContext();
const ControllerProvider = ({ value, children }) => {
  return (
    <ControllerContext.Provider value={value}>
      {children}
    </ControllerContext.Provider>
  );
};

const useController = () => {
  return useContext(ControllerContext);
};

export {
  DefaultController,
  SettingsMenuController,
  LinkFieldController,
  DropZoneController,
  ControllerProvider,
  useController,
};

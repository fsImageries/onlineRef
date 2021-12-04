import React, {useContext} from "react";
import $ from "jquery";
import { useEffectState, getStoredSettings } from "js/helper";

const baseSettings = {
  stageBg: $(":root").css("--bg-color2"),
  showGuides: true,
};

class StoredConfig {
  constructor(defaults = null) {
    if (defaults === null) {
      const stored = getStoredSettings();
      defaults = stored === null ? { ...baseSettings } : stored;
    }

    const [settings, setSettings] = useEffectState(defaults);

    this._settings = settings;
    this.setSettings = setSettings;
  }

  get settings() {
    return this._settings.current;
  }

  get stageBg() {
    return this.settings.stageBg;
  }

  get showGuides() {
    return this.settings.showGuides;
  }

  setStageBg(val) {
    this.setSettings({
      ...this.settings,
      stageBg: val,
    });
  }

  setShowGuides(val) {
    this.setSettings({
      ...this.settings,
      showGuides: val,
    });
  }

  reset() {
    this.setSettings({ ...baseSettings });
  }
}

const StoredConfigContext = React.createContext();
const StoredConfigProvider = ({ value, children }) => {
  return (
    <StoredConfigContext.Provider value={value}>
      {children}
    </StoredConfigContext.Provider>
  );
};

const useStoredConfig = () => {
  return useContext(StoredConfigContext);
};

export { StoredConfig, StoredConfigProvider, useStoredConfig };

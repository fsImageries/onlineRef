import React, { useContext } from "react";

import { useEffectState } from "js/helper";

class Media {
  constructor(defaults = []) {
    const [media, setMedia] = useEffectState(defaults);

    this._media = media;
    this.setMedia = setMedia;
  }

  get media() {
    return this._media.current;
  }

  addMedia(media, iter = false) {
    if (iter) this.setMedia([...this.media, ...media]);
    else this.setMedia([...this.media, media]);
  }
}

const MediaContext = React.createContext();
const MediaProvider = ({ value, children }) => {
  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
};

const useMedia = () => {
  return useContext(MediaContext);
};

export { Media, MediaProvider, useMedia };

import React, {useContext} from "react";

import { useEffectState } from "js/helper";

class StageStates {
  constructor(defaults = null) {
    if (defaults === null) {
      defaults = {
        stageDrag: false,
        isGuides: false,
        isResize: false,
        isRot: false,
        rotateFree: false,
        scaleBy: 1.015
      };
    }
    const [states, setStates] = useEffectState(defaults);

    this._states = states;
    this.setStates = setStates;
  }

  get states() {
    return this._states.current;
  }

  get stageDrag() {
    return this.states.stageDrag;
  }

  get isGuides() {
    return this.states.isGuides;
  }

  get isResize() {
    return this.states.isResize;
  }

  get isRot() {
    return this.states.isRot;
  }

  get rotateFree() {
    return this.states.rotateFree;
  }

  get scaleBy(){
    return this.states.scaleBy
  }

  setStageDrag(val) {
    this.setStates({
      ...this.states,
      stageDrag: val,
    });
  }

  setGuides(val) {
    this.setStates({
      ...this.states,
      isGuides: val,
    });
  }

  setResize(val) {
    this.setStates({
      ...this.states,
      isResize: val,
      isRot: val ? false : this.states.isRot
    });
  }

  setRot(val) {
    this.setStates({
      ...this.states,
      isRot: val,
      isResize: val ? false : this.states.isResize
    });
  }

  setRotateFree(val) {
    this.setStates({
      ...this.states,
      rotateFree: val,
    });
  }

  setScaleBy(val) {
    this.setStates({
      ...this.states,
      scaleBy: val ? 1.5: 1.015
    })
  }
}

const StageStatesContext = React.createContext()
const StageStatesProvider = ({value, children}) => {
    return (
        <StageStatesContext.Provider value={value}>
            {children}
        </StageStatesContext.Provider>
    )
}

const useStageStates = () =>{
    return useContext(StageStatesContext)
}

export {StageStates, StageStatesProvider, useStageStates}
// export default StageStates;

import React, {useContext, useRef} from "react";

import { useEffectState } from "src/js/helper";

const selectionInitial = {
  visible: false,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
};

class Selection {
  constructor() {
    const [selectedId, selectShape] = useEffectState(null);
    const [nodesArray, setNodes] = useEffectState([]);

    this._selectedId = selectedId;
    this._nodesArray = nodesArray;

    this.selectShape = selectShape;
    this.setNodes = setNodes;

    this._stageRef = useRef();
    this._layerRef = useRef();
    this._trRef = useRef();
    this._selectionRectRef = useRef();
    this._curSelection = useRef({ ...selectionInitial });
  }

  get selectedId() {
    return this._selectedId.current;
  }

  get nodesArray() {
    return this._nodesArray.current;
  }

  get stageRef() {
    return this._stageRef.current;
  }

  get layerRef() {
    return this._layerRef.current;
  }

  get trRef() {
    return this._trRef.current;
  }

  get selectionRectRef() {
    return this._selectionRectRef.current;
  }

  get curSelection() {
    return this._curSelection.current;
  }
}

const SelectionContext = React.createContext();
const SelectionProvider = ({ value, children }) => {
  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

const useSelection = () => {
  return useContext(SelectionContext);
};

export { Selection, SelectionProvider, useSelection };

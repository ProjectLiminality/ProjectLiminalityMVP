import { produce } from 'immer';

const initialState = {
  past: [],
  present: null,
  future: []
};

const MAX_HISTORY_LENGTH = 50;

const logGraphState = (state) => {
  if (state.lastAction && state.lastAction.type !== 'UPDATE_VIEW_SCALE_FACTORS') {
    console.log('Current Graph State:');
    console.log('Past:', state.past.length, 'actions');
    console.log('Present:', state.present ? `${state.present.length} nodes` : 'null');
    console.log('Future:', state.future.length, 'actions');
    if (state.present) {
      console.log('Nodes:', state.present.map(node => ({
        repoName: node.repoName,
        position: node.position.toArray(),
        isInLiminalView: node.isInLiminalView
      })));
    }
    console.log('Last Action:', state.lastAction);
  }
};

export const historyReducer = produce((draft, action) => {
  switch (action.type) {
    case 'UPDATE_GRAPH':
      draft.past.push({ state: draft.present, action: action.lastAction });
      if (draft.past.length > MAX_HISTORY_LENGTH) {
        draft.past.shift();
      }
      draft.present = action.payload;
      draft.future = [];
      draft.lastAction = action.lastAction;
      console.log('Graph updated:', action.lastAction.type);
      logGraphState(draft);
      break;
    case 'UPDATE_VIEW_SCALE_FACTORS':
      draft.present = action.payload;
      // Don't update past, future, or lastAction for scale factor updates
      return; // Exit early to avoid unnecessary state updates
    case 'UNDO':
      if (draft.past.length > 0) {
        console.log('Undoing action');
        const previous = draft.past.pop();
        draft.future.unshift({ state: draft.present, action: draft.lastAction });
        draft.present = previous.state;
        draft.lastAction = previous.action;
        logGraphState(draft);
      } else {
        console.log('No more actions to undo');
      }
      break;
    case 'REDO':
      if (draft.future.length > 0) {
        console.log('Redoing action');
        const next = draft.future.shift();
        draft.past.push({ state: draft.present, action: draft.lastAction });
        draft.present = next.state;
        draft.lastAction = next.action;
        logGraphState(draft);
      } else {
        console.log('No more actions to redo');
      }
      break;
    default:
      break;
  }
});

export const updateGraph = (newState, lastAction) => ({ 
  type: 'UPDATE_GRAPH', 
  payload: newState, 
  lastAction 
});
export const undo = () => ({ type: 'UNDO' });
export const redo = () => ({ type: 'REDO' });

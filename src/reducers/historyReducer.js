import { produce } from 'immer';

const initialState = {
  past: [],
  present: null,
  future: []
};

const MAX_HISTORY_LENGTH = 50;

export const historyReducer = produce((draft, action) => {
  switch (action.type) {
    case 'UPDATE_GRAPH':
      draft.past.push(draft.present);
      if (draft.past.length > MAX_HISTORY_LENGTH) {
        draft.past.shift();
      }
      draft.present = action.payload;
      draft.future = [];
      break;
    case 'UNDO':
      if (draft.past.length > 0) {
        console.log('Undoing action');
        const previous = draft.past.pop();
        draft.future.unshift(draft.present);
        draft.present = previous;
      } else {
        console.log('No more actions to undo');
      }
      break;
    case 'REDO':
      if (draft.future.length > 0) {
        console.log('Redoing action');
        const next = draft.future.shift();
        draft.past.push(draft.present);
        draft.present = next;
      } else {
        console.log('No more actions to redo');
      }
      break;
    default:
      break;
  }
});

export const updateGraph = (newState) => ({ type: 'UPDATE_GRAPH', payload: newState });
export const undo = () => ({ type: 'UNDO' });
export const redo = () => ({ type: 'REDO' });

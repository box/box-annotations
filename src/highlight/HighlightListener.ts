import debounce from 'lodash/debounce';
import { AppStore, getIsSelecting, SelectionArg as Selection, setSelectionAction } from '../store';

export type Options = {
    getSelection: () => Selection | null;
    store: AppStore;
};

// Debounce 500ms for keyboard selection
const SELECTION_CHANGE_DEBOUNCE = 500;

export default class HighlightListener {
    getSelection: () => Selection | null;

    store: AppStore;

    constructor({ getSelection, store }: Options) {
        this.getSelection = getSelection;
        this.store = store;

        document.addEventListener('selectionchange', this.debounceHandleSelectionChange);
    }

    destroy(): void {
        document.removeEventListener('selectionchange', this.debounceHandleSelectionChange);
    }

    handleSelectionChange = (): void => {
        if (getIsSelecting(this.store.getState())) {
            return;
        }

        this.store.dispatch(setSelectionAction(this.getSelection()));
    };

    debounceHandleSelectionChange = debounce(this.handleSelectionChange, SELECTION_CHANGE_DEBOUNCE);
}

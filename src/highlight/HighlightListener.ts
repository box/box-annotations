import debounce from 'lodash/debounce';
import {
    AppStore,
    getActiveAnnotationId,
    getIsSelecting,
    getRotation,
    SelectionArg as Selection,
    setSelectionAction,
} from '../store';

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
        const state = this.store.getState();
        // Clicking a highlight can restore a text selection; do not stage a new
        // promoter while a thread is already open.
        if (getIsSelecting(state) || getActiveAnnotationId(state)) {
            return;
        }

        const selection = this.getSelection();
        const rotation = getRotation(state);
        this.store.dispatch(setSelectionAction(selection ? { ...selection, rotation } : null));
    };

    debounceHandleSelectionChange = debounce(this.handleSelectionChange, SELECTION_CHANGE_DEBOUNCE);
}

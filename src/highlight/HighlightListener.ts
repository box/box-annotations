import debounce from 'lodash/debounce';
import { AppStore, getIsInitialized, SelectionArg as Selection, setSelectionAction } from '../store';
import { MOUSE_PRIMARY } from '../constants';

export type Options = {
    getSelection: () => Selection | null;
    selectionChangeDelay?: number;
    store: AppStore;
};

// Debounce 500ms for keyboard selection
const SELECTION_CHANGE_DEBOUNCE = 500;

export default class HighlightListener {
    annotatedEl?: HTMLElement;

    getSelection: () => Selection | null;

    isMouseSelecting = false;

    selectionChangeDelay?: number;

    selectionChangeTimer?: number;

    store: AppStore;

    constructor({ getSelection, selectionChangeDelay = 0, store }: Options) {
        this.getSelection = getSelection;
        this.selectionChangeDelay = selectionChangeDelay;
        this.store = store;

        document.addEventListener('selectionchange', this.debounceHandleSelectionChange);
    }

    destroy(): void {
        clearTimeout(this.selectionChangeTimer);

        document.removeEventListener('selectionchange', this.debounceHandleSelectionChange);

        if (this.annotatedEl) {
            this.annotatedEl.removeEventListener('mousedown', this.handleMouseDown);
            this.annotatedEl.removeEventListener('mouseup', this.handleMouseUp);
        }
    }

    init(annotatedEl: HTMLElement): void {
        this.annotatedEl = annotatedEl;

        // Clear previous selection
        this.store.dispatch(setSelectionAction(null));

        if (!getIsInitialized(this.store.getState())) {
            this.annotatedEl.addEventListener('mousedown', this.handleMouseDown);
            this.annotatedEl.addEventListener('mouseup', this.handleMouseUp);
        }
    }

    setSelection = (): void => {
        this.store.dispatch(setSelectionAction(this.getSelection()));
    };

    handleMouseDown = ({ buttons }: MouseEvent): void => {
        if (buttons !== MOUSE_PRIMARY) {
            return;
        }

        this.isMouseSelecting = true;

        clearTimeout(this.selectionChangeTimer);
        this.store.dispatch(setSelectionAction(null));
    };

    handleMouseUp = (): void => {
        if (!this.isMouseSelecting) {
            return;
        }

        this.selectionChangeTimer = window.setTimeout(() => {
            this.setSelection();
            this.isMouseSelecting = false;
        }, this.selectionChangeDelay);
    };

    handleSelectionChange = (): void => {
        if (this.isMouseSelecting) {
            return;
        }

        this.setSelection();
    };

    debounceHandleSelectionChange = debounce(this.handleSelectionChange, SELECTION_CHANGE_DEBOUNCE);
}

import {
    AppStore,
    getIsSelecting,
    getRotation,
    SelectionArg as Selection,
    setIsSelectingAction,
    setSelectionAction,
} from '../store';
import { Manager, Options as BaseOptions } from '../common/BaseManager';
import { MOUSE_PRIMARY } from '../constants';

export type Options = {
    getSelection: () => Selection | null;
    selectionChangeDelay?: number;
    store: AppStore;
} & BaseOptions;

export default class HighlightCreatorManager implements Manager {
    referenceEl: HTMLElement;

    getSelection: () => Selection | null;

    selectionChangeDelay?: number;

    selectionChangeTimer?: number;

    store: AppStore;

    constructor({ getSelection, referenceEl, selectionChangeDelay = 0, store }: Options) {
        this.getSelection = getSelection;
        this.referenceEl = referenceEl;
        this.selectionChangeDelay = selectionChangeDelay;
        this.store = store;
    }

    exists(parentEl: HTMLElement): boolean {
        return parentEl.contains(this.referenceEl);
    }

    render(): void {
        // Clear previous selection
        this.store.dispatch(setSelectionAction(null));

        this.referenceEl.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    style(): CSSStyleDeclaration {
        return this.referenceEl.style;
    }

    destroy(): void {
        clearTimeout(this.selectionChangeTimer);

        this.referenceEl.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseDown = ({ buttons }: MouseEvent): void => {
        if (buttons !== MOUSE_PRIMARY) {
            return;
        }

        clearTimeout(this.selectionChangeTimer);

        this.store.dispatch(setIsSelectingAction(true));
        this.store.dispatch(setSelectionAction(null));
    };

    handleMouseUp = (): void => {
        if (!getIsSelecting(this.store.getState())) {
            return;
        }

        this.selectionChangeTimer = window.setTimeout(() => {
            const selection = this.getSelection();
            const rotation = getRotation(this.store.getState());
            this.store.dispatch(setSelectionAction(selection ? { ...selection, rotation } : null));
            this.store.dispatch(setIsSelectingAction(false));
        }, this.selectionChangeDelay);
    };
}

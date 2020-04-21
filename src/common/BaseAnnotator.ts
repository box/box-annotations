import { Store } from 'redux';
import { IntlShape } from 'react-intl';
import eventManager from './EventManager';
import i18n from '../utils/i18n';
import messages from '../messages';
import { Event, IntlOptions, LegacyEvent, Permissions } from '../@types';
import {
    createStore,
    Mode,
    setActiveAnnotationIdAction,
    setVisibilityAction,
    toggleAnnotationModeAction,
} from '../store';
import './BaseAnnotator.scss';

export type Container = string | HTMLElement;

export type Options = {
    apiHost: string;
    container: Container;
    file: {
        id: string;
        file_version: {
            id: string;
        };
        permissions: Permissions;
    };
    hasTouch?: boolean;
    intl: IntlOptions;
    locale?: string;
    token: string;
};

export default class BaseAnnotator {
    container: Container;

    intl: IntlShape;

    rootEl?: HTMLElement | null;

    scale = 1;

    store: Store;

    constructor({ container, intl }: Options) {
        this.container = container;
        this.intl = i18n.createIntlProvider(intl);
        this.store = createStore();

        // Add custom handlers for events triggered by the Preview SDK
        this.addListener(LegacyEvent.SCALE, this.handleScale);
        this.addListener(Event.ACTIVE_SET, this.setActiveAnnotationId);
        this.addListener(Event.VISIBLE_SET, this.setVisibility);
    }

    destroy(): void {
        if (this.rootEl) {
            this.rootEl.classList.remove('ba');
        }

        this.removeListener(LegacyEvent.SCALE, this.handleScale);
        this.removeListener(Event.ACTIVE_SET, this.setActiveAnnotationId);
        this.removeListener(Event.VISIBLE_SET, this.setVisibility);
    }

    getElement(selector: HTMLElement | string): HTMLElement | null {
        return typeof selector === 'string' ? document.querySelector(selector) : selector;
    }

    handleScale = ({ scale }: { scale: number }): void => {
        this.init(scale);
    };

    // Called by box-content-preview
    init(scale: number): void {
        this.rootEl = this.getElement(this.container);
        this.scale = scale;

        if (!this.rootEl) {
            this.emit(LegacyEvent.ERROR, this.intl.formatMessage(messages.annotationsLoadError));
            return;
        }

        this.rootEl.classList.add('ba');
    }

    scrollToAnnotation(): void {
        // Called by box-content-preview
    }

    setActiveAnnotationId = (annotationId: string | null): void => {
        this.store.dispatch(setActiveAnnotationIdAction(annotationId));
    };

    toggleAnnotationMode(mode: Mode): void {
        // Called by box-content-preview
        this.store.dispatch(toggleAnnotationModeAction(mode));
    }

    setVisibility = (visibility: boolean): void => {
        this.store.dispatch(setVisibilityAction(visibility));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener(event: string | symbol, listener: (...args: any[]) => void): void {
        eventManager.addListener(event, listener);
    }

    removeAllListeners(): void {
        eventManager.removeAllListeners();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeListener(event: string | symbol, listener: (...args: any[]) => void): void {
        eventManager.removeListener(event, listener);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emit(event: string | symbol, ...args: any[]): void {
        eventManager.emit(event, ...args);
    }
}

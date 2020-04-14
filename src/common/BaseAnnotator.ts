import { Store } from 'redux';
import { IntlShape } from 'react-intl';
import FileVersionAPI from '../api/FileVersionAPI';
import eventManager from './EventManager';
import i18n from '../utils/i18n';
import messages from '../messages';
import { IntlOptions, Permissions } from '../@types';
import {
    createStore,
    Mode,
    toggleAnnotationModeAction,
    setVisibilityAction,
    setActiveAnnotationAction,
    getAnnotation,
} from '../store';
import './BaseAnnotator.scss';
import { Event } from '../store/eventing';

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
    api: FileVersionAPI;

    container: Container;

    intl: IntlShape;

    rootEl?: HTMLElement | null;

    scale = 1;

    store: Store;

    constructor({ apiHost, container, intl, file, token }: Options) {
        this.api = new FileVersionAPI({
            apiHost,
            fileId: file.id,
            permissions: file.permissions || {},
            token,
        });
        this.container = container;
        this.intl = i18n.createIntlProvider(intl);
        this.store = createStore();

        // Add custom handlers for events triggered by the Preview SDK
        this.addListener(Event.SCALE, this.handleScale);
        this.addListener(Event.SET_SELECTED, this.setActiveAnnotationById);
        this.addListener(Event.SET_VISIBILITY, this.setVisibility);
    }

    destroy(): void {
        if (this.rootEl) {
            this.rootEl.classList.remove('ba');
        }

        this.api.destroy();
        this.removeListener(Event.SCALE, this.handleScale);
        this.removeListener(Event.SET_SELECTED, this.setActiveAnnotationById);
        this.removeListener(Event.SET_VISIBILITY, this.setVisibility);
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
            this.emit(Event.ERROR, this.intl.formatMessage(messages.annotationsLoadError));
            return;
        }

        this.rootEl.classList.add('ba');
    }

    scrollToAnnotation(): void {
        // Called by box-content-preview
    }

    setActiveAnnotationById = (annotationId: string): void => {
        const annotationExists = getAnnotation(this.store.getState(), annotationId) !== undefined;
        if (!annotationId || !annotationExists) {
            return;
        }

        this.store.dispatch(setActiveAnnotationAction(annotationId));
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeListener(event: string | symbol, listener: (...args: any[]) => void): void {
        eventManager.removeListener(event, listener);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emit(event: string | symbol, ...args: any[]): void {
        eventManager.emit(event, ...args);
    }
}

import { IntlShape } from 'react-intl';
import * as store from '../store';
import API from '../api';
import eventManager from './EventManager';
import i18n from '../utils/i18n';
import messages from '../messages';
import { Event, IntlOptions, LegacyEvent, Permissions } from '../@types';
import './BaseAnnotator.scss';

export type Container = string | HTMLElement;

export type FileOptions = {
    [key: string]: {
        annotations?: {
            activeId?: string;
        };
    };
};

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
    fileOptions?: FileOptions;
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

    store: store.AppStore;

    constructor({ apiHost, container, file, fileOptions, intl, token }: Options) {
        const activeId = fileOptions?.[file.id]?.annotations?.activeId ?? null;
        const initialState = {
            annotations: {
                activeId,
            },
            options: {
                fileId: file.id,
                fileVersionId: file.file_version.id,
            },
        };

        this.container = container;
        this.intl = i18n.createIntlProvider(intl);
        this.store = store.createStore(initialState, {
            api: new API({ apiHost, token }),
        });

        // Add custom handlers for events triggered by the Preview SDK
        this.addListener(LegacyEvent.SCALE, this.handleScale);
        this.addListener(Event.ACTIVE_SET, this.setActiveAnnotationId);
        this.addListener(Event.ANNOTATION_DELETE, this.deleteAnnotation);
        this.addListener(Event.VISIBLE_SET, this.setVisibility);

        // Load any required data at startup
        this.hydrate();
    }

    destroy(): void {
        if (this.rootEl) {
            this.rootEl.classList.remove('ba');
        }

        this.removeListener(LegacyEvent.SCALE, this.handleScale);
        this.removeListener(Event.ACTIVE_SET, this.setActiveAnnotationId);
        this.removeListener(Event.ANNOTATION_DELETE, this.deleteAnnotation);
        this.removeListener(Event.VISIBLE_SET, this.setVisibility);
    }

    getElement(selector: HTMLElement | string): HTMLElement | null {
        return typeof selector === 'string' ? document.querySelector(selector) : selector;
    }

    handleScale = ({ scale }: { scale: number }): void => {
        this.init(scale);
    };

    hydrate(): void {
        // Redux dispatch method signature doesn't seem to like async actions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.store.dispatch<any>(store.fetchAnnotationsAction());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.store.dispatch<any>(store.fetchCollaboratorsAction());
    }

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

    deleteAnnotation = (annotationId: string): void => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.store.dispatch<any>(store.deleteAnnotationAction(annotationId));
    };

    scrollToAnnotation(): void {
        // Called by box-content-preview
    }

    setActiveAnnotationId = (annotationId: string | null): void => {
        this.store.dispatch(store.setActiveAnnotationIdAction(annotationId));
    };

    setVisibility = (visibility: boolean): void => {
        if (!this.rootEl) {
            return;
        }
        if (visibility) {
            this.rootEl.classList.remove('is-hidden');
        } else {
            this.rootEl.classList.add('is-hidden');
        }
    };

    toggleAnnotationMode(mode: store.Mode): void {
        // Called by box-content-preview
        this.store.dispatch(store.toggleAnnotationModeAction(mode));
    }

    addListener(event: string | symbol, listener: (...args: any[]) => void): void {
        eventManager.addListener(event, listener);
    }

    removeAllListeners(): void {
        eventManager.removeAllListeners();
    }

    removeListener(event: string | symbol, listener: (...args: any[]) => void): void {
        eventManager.removeListener(event, listener);
    }

    emit(event: string | symbol, ...args: any[]): void {
        eventManager.emit(event, ...args);
    }
}

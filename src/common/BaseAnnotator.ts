import { IntlShape } from 'react-intl';
import * as store from '../store';
import API from '../api';
import EventEmitter from './EventEmitter';
import i18n from '../utils/i18n';
import messages from '../messages';
import { Annotation, Event, IntlOptions, LegacyEvent, Permissions } from '../@types';
import { getAnnotation } from '../store';
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

export default class BaseAnnotator extends EventEmitter {
    container: Container;

    intl: IntlShape;

    rootEl?: HTMLElement | null;

    scale = 1;

    store: store.AppStore;

    constructor({ apiHost, container, file, fileOptions, intl, token }: Options) {
        super();

        const initialState = {
            annotations: {
                activeId: fileOptions?.[file.id]?.annotations?.activeId ?? null,
            },
            options: {
                fileId: file.id,
                fileVersionId: file.file_version.id,
                permissions: file.permissions,
            },
        };

        this.container = container;
        this.intl = i18n.createIntlProvider(intl);
        this.store = store.createStore(initialState, {
            api: new API({ apiHost, token }),
        });

        // Add custom handlers for events triggered by the Preview SDK
        this.addListener(LegacyEvent.SCALE, this.handleScale);
        this.addListener(Event.ACTIVE_SET, this.handleSetActive);
        this.addListener(Event.ANNOTATION_REMOVE, this.handleRemove);
        this.addListener(Event.VISIBLE_SET, this.handleSetVisible);

        // Load any required data at startup
        this.hydrate();
    }

    public destroy(): void {
        if (this.rootEl) {
            this.rootEl.classList.remove('ba');
        }

        this.removeListener(LegacyEvent.SCALE, this.handleScale);
        this.removeListener(Event.ACTIVE_SET, this.handleSetActive);
        this.removeListener(Event.ANNOTATION_REMOVE, this.handleRemove);
        this.removeListener(Event.VISIBLE_SET, this.handleSetVisible);
    }

    public getAnnotationById(annotationId: string): Annotation | undefined {
        return getAnnotation(this.store.getState(), annotationId);
    }

    public init(scale: number): void {
        this.rootEl = this.getElement(this.container);
        this.scale = scale;

        if (!this.rootEl) {
            this.emit(LegacyEvent.ERROR, this.intl.formatMessage(messages.annotationsLoadError));
            return;
        }

        this.rootEl.classList.add('ba');
    }

    public removeAnnotation = (annotationId: string): void => {
        this.store.dispatch(store.removeAnnotationAction(annotationId));
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public scrollToAnnotation(annotationId: string | null): void {
        // Called by box-content-preview
    }

    public setActiveId(annotationId: string | null): void {
        this.store.dispatch(store.setActiveAnnotationIdAction(annotationId));
    }

    public setVisibility(visibility: boolean): void {
        if (!this.rootEl) {
            return;
        }
        if (visibility) {
            this.rootEl.classList.remove('is-hidden');
        } else {
            this.rootEl.classList.add('is-hidden');
        }
    }

    public toggleAnnotationMode(mode: store.Mode): void {
        this.store.dispatch(store.toggleAnnotationModeAction(mode));
    }

    protected getElement(selector: HTMLElement | string): HTMLElement | null {
        return typeof selector === 'string' ? document.querySelector(selector) : selector;
    }

    protected handleRemove = (annotationId: string): void => {
        this.removeAnnotation(annotationId);
    };

    protected handleScale = ({ scale }: { scale: number }): void => {
        this.init(scale);
    };

    protected handleSetActive = (annotationId: string | null): void => {
        this.setActiveId(annotationId);
    };

    protected handleSetVisible = (visibility: boolean): void => {
        this.setVisibility(visibility);
    };

    protected hydrate(): void {
        // Redux dispatch method signature doesn't seem to like async actions
        this.store.dispatch<any>(store.fetchAnnotationsAction()); // eslint-disable-line @typescript-eslint/no-explicit-any
        this.store.dispatch<any>(store.fetchCollaboratorsAction()); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
}

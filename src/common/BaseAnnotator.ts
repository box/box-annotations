import { IntlShape } from 'react-intl';
import * as store from '../store';
import API from '../api';
import EventEmitter from './EventEmitter';
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
        currentFileVersionId?: string;
        fileVersionId?: string;
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
    showAnnotationsHighlightText?: boolean;
    token: string;
};

export const CSS_CONTAINER_CLASS = 'ba';
export const CSS_LOADED_CLASS = 'ba-annotations-loaded';

export default class BaseAnnotator extends EventEmitter {
    annotatedEl?: HTMLElement | null;

    containerEl?: HTMLElement | null;

    container: Container;

    intl: IntlShape;

    showHighlight: boolean;

    store: store.AppStore;

    constructor({ apiHost, container, file, fileOptions, intl, showAnnotationsHighlightText = false, token }: Options) {
        super();

        const fileOptionsValue = fileOptions?.[file.id];
        const currentFileVersionId = fileOptionsValue?.currentFileVersionId;
        const fileOptionsVersionId = fileOptionsValue?.fileVersionId;
        const fileVersionId = file.file_version.id; // This is always the currently-previewed version id, not current version id

        const initialState = {
            annotations: {
                activeId: fileOptionsValue?.annotations?.activeId ?? null,
            },
            options: {
                fileId: file.id,
                fileVersionId: fileOptionsVersionId ?? fileVersionId,
                isCurrentFileVersion: !fileOptionsVersionId || fileOptionsVersionId === currentFileVersionId,
                permissions: file.permissions,
            },
        };

        this.container = container;
        this.intl = i18n.createIntlProvider(intl);
        this.store = store.createStore(initialState, {
            api: new API({ apiHost, token }),
        });
        this.showHighlight = showAnnotationsHighlightText;

        // Add custom handlers for events triggered by the Preview SDK
        this.addListener(LegacyEvent.SCALE, this.handleScale);
        this.addListener(Event.ACTIVE_SET, this.handleSetActive);
        this.addListener(Event.ANNOTATION_REMOVE, this.handleRemove);
        this.addListener(Event.VISIBLE_SET, this.handleSetVisible);

        // Load any required data at startup
        this.hydrate();
    }

    public destroy(): void {
        if (this.containerEl) {
            this.containerEl.classList.remove(CSS_CONTAINER_CLASS);
        }

        if (this.annotatedEl) {
            this.annotatedEl.classList.remove(CSS_LOADED_CLASS);
        }

        this.removeListener(LegacyEvent.SCALE, this.handleScale);
        this.removeListener(Event.ACTIVE_SET, this.handleSetActive);
        this.removeListener(Event.ANNOTATION_REMOVE, this.handleRemove);
        this.removeListener(Event.VISIBLE_SET, this.handleSetVisible);
    }

    public init(scale = 1, rotation = 0): void {
        this.containerEl = this.getElement(this.container);
        this.annotatedEl = this.getAnnotatedElement();

        if (!this.annotatedEl || !this.containerEl) {
            this.emit(LegacyEvent.ERROR, this.intl.formatMessage(messages.annotationsLoadError));
            return;
        }

        // Add classes to the parent elements to support CSS scoping
        this.annotatedEl.classList.add(CSS_LOADED_CLASS);
        this.containerEl.classList.add(CSS_CONTAINER_CLASS);

        // Defer to the child class to render annotations
        this.render();

        // Update the store now that annotations have been rendered
        this.store.dispatch(store.setRotationAction(rotation));
        this.store.dispatch(store.setScaleAction(scale));
        this.store.dispatch(store.setIsInitialized());
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
        if (!this.containerEl) {
            return;
        }

        if (visibility) {
            this.containerEl.classList.remove('is-hidden');
        } else {
            this.containerEl.classList.add('is-hidden');
        }
    }

    public toggleAnnotationMode(mode: store.Mode): void {
        this.store.dispatch(store.toggleAnnotationModeAction(mode));
    }

    protected getAnnotatedElement(): HTMLElement | null | undefined {
        return undefined; // Must be implemented in child class
    }

    protected getElement(selector: HTMLElement | string): HTMLElement | null {
        return typeof selector === 'string' ? document.querySelector(selector) : selector;
    }

    protected handleRemove = (annotationId: string): void => {
        this.removeAnnotation(annotationId);
    };

    protected handleScale = ({ rotationAngle, scale }: { rotationAngle: number; scale: number }): void => {
        this.init(scale, rotationAngle);
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
    }

    protected render(): void {
        // Must be implemented in child class
    }
}

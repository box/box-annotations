import { EventEmitter } from 'events';
import { Store } from 'redux';
import { IntlShape } from 'react-intl';
import FileVersionAPI from '../api/FileVersionAPI';
import i18n from '../utils/i18n';
import messages from '../messages';
import { ANNOTATOR_EVENT } from '../constants';
import { IntlOptions, Permissions } from '../@types';
import { createStore, Mode, toggleAnnotationModeAction, toggleAnnotationVisibilityAction } from '../store';
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

export default class BaseAnnotator extends EventEmitter {
    api: FileVersionAPI;

    container: Container;

    intl: IntlShape;

    rootEl?: HTMLElement | null;

    scale = 1;

    store: Store;

    constructor({ apiHost, container, intl, file, token }: Options) {
        super();

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
        this.addListener(ANNOTATOR_EVENT.scale, this.handleScale);
        this.addListener(ANNOTATOR_EVENT.visibilityToggle, this.toggleAnnotationVisibility);
    }

    destroy(): void {
        if (this.rootEl) {
            this.rootEl.classList.remove('ba');
        }

        this.api.destroy();
        this.removeListener(ANNOTATOR_EVENT.scale, this.handleScale);
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
            this.emit(ANNOTATOR_EVENT.error, this.intl.formatMessage(messages.annotationsLoadError));
            return;
        }

        this.rootEl.classList.add('ba');
    }

    scrollToAnnotation(): void {
        // Called by box-content-preview
    }

    toggleAnnotationMode(mode: Mode): void {
        // Called by box-content-preview
        this.store.dispatch(toggleAnnotationModeAction(mode));
    }

    toggleAnnotationVisibility(): void {
        // Called by box-content-preview
        this.store.dispatch(toggleAnnotationVisibilityAction());
    }
}

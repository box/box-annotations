import { EventEmitter } from 'events';
import { IntlShape } from 'react-intl';
import FileVersionAPI from '../api/FileVersionAPI';
import i18n from '../utils/i18n';
import messages from '../messages';
import { ANNOTATOR_EVENT } from '../constants';
import { IntlOptions, Permissions } from '../@types';

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

    intl: IntlShape;

    container: Container;

    rootEl?: HTMLElement;

    scale = 1;

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

        // Add custom handlers for events triggered by the Preview SDK
        this.addListener(ANNOTATOR_EVENT.scale, this.handleScale);
    }

    destroy(): void {
        this.api.destroy();
        this.removeListener(ANNOTATOR_EVENT.scale, this.handleScale);
    }

    getEl(selector: HTMLElement | string): HTMLElement {
        return (typeof selector === 'string' ? document.querySelector(selector) : selector) as HTMLElement;
    }

    handleScale = ({ scale }: { scale: number }): void => {
        this.init(scale);
    };

    // Called by box-content-preview
    init(scale: number): void {
        this.rootEl = this.getEl(this.container);
        this.scale = scale;

        if (!this.rootEl) {
            this.emit(ANNOTATOR_EVENT.error, this.intl.formatMessage(messages.annotationsLoadError));
        }
    }

    scrollToAnnotation(): void {
        // Called by box-content-preview
    }

    toggleAnnotationMode(): void {
        // Called by box-content-preview
    }
}

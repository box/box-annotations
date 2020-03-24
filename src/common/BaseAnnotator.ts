import { EventEmitter } from 'events';
import FileVersionAPI from '../api/FileVersionAPI';
import i18n from '../utils/i18n';
import messages from '../messages';
import { ANNOTATOR_EVENT } from '../constants';
import { Permissions } from '../@types';

export type Options = {
    apiHost: string;
    container: string | HTMLElement | null;
    file: {
        id: string;
        file_version: {
            id: string;
        };
        permissions: Permissions;
    };
    hasTouch?: boolean;
    intl: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    locale?: string;
    token: string;
};

export default class BaseAnnotator extends EventEmitter {
    api: FileVersionAPI;

    intl: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    options: Options;

    rootEl?: HTMLElement;

    scale = 1;

    constructor(options: Options) {
        super();

        const { apiHost, intl = {}, file, token } = options;

        this.api = new FileVersionAPI({
            apiHost,
            fileId: file.id,
            permissions: file.permissions || {},
            token,
        });
        this.intl = i18n.createIntlProvider(intl);
        this.options = options;
    }

    destroy(): void {
        this.api.destroy();
    }

    // Called by box-content-preview
    init(scale: number): void {
        const { container } = this.options;

        this.rootEl = (typeof container === 'string' ? document.querySelector(container) : container) as HTMLElement;
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

// @flow
import AnnotationModeController from './AnnotationModeController';
import DocHighlightThread from '../doc/DocHighlightThread';
import { clearCanvas, getPageEl } from '../util';
import {
    ANNOTATOR_TYPE,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    TYPES,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT_COMMENT,
} from '../constants';
import messages from '../messages';

class HighlightModeController extends AnnotationModeController {
    /** @property {boolean} */
    canComment: boolean;

    /** @inheritdoc */
    handleThreadEvents(thread: AnnotationThread, data: Object): void {
        switch (data.event) {
            case THREAD_EVENT.save:
                // Re-render plain highlight canvas when a plain highlight is converted to a highlight comment
                if (thread.type === TYPES.highlight && thread.comments.length > 0) {
                    this.renderPage(thread.location.page);
                }
                break;
            case THREAD_EVENT.delete:
                this.emit(CONTROLLER_EVENT.renderPage, thread.location.page);
                break;
            default:
        }

        super.handleThreadEvents(thread, data);
    }

    showButton(): void {
        super.showButton();
        this.buttonEl.title = this.intl.formatMessage(messages.annotationHighlightToggle);
    }

    /** @inheritdoc */
    resetMode(): void {
        this.destroyPendingThreads();
        window.getSelection().removeAllRanges();
        this.unbindListeners(); // Disable mode
        this.emit(CONTROLLER_EVENT.bindDOMListeners);
    }

    /** @inheritdoc */
    enter(): void {
        this.emit(CONTROLLER_EVENT.unbindDOMListeners); // Disable other annotations
        this.bindListeners(); // Enable mode
    }

    /** @inheritdoc */
    render(): void {
        super.render();
        this.destroyPendingThreads();
    }

    /** @inheritdoc */
    renderPage(pageNum: string): void {
        // Clear context if needed
        const pageEl = getPageEl(this.annotatedElement, pageNum);
        const layerClass =
            this.mode === TYPES.highlight ? CLASS_ANNOTATION_LAYER_HIGHLIGHT : CLASS_ANNOTATION_LAYER_HIGHLIGHT_COMMENT;
        clearCanvas(pageEl, layerClass);

        if (!this.annotations) {
            return;
        }

        super.renderPage(pageNum);
    }

    /** @inheritdoc */
    instantiateThread(params: Object): ?DocHighlightThread {
        return this.annotatorType === ANNOTATOR_TYPE.document ? new DocHighlightThread(params, this.canComment) : null;
    }
}

export default HighlightModeController;

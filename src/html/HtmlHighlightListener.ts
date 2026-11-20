import HighlightListener, { Options as BaseOptions } from '../highlight/HighlightListener';

type Options = BaseOptions & {
    ownerDocument: Document;
};

// HighlightListener listens for selectionchange on this page's document. The content may live in a frame document,
// which fires its own selectionchange events.
export default class HtmlHighlightListener extends HighlightListener {
    ownerDocument: Document;

    constructor({ ownerDocument, ...options }: Options) {
        super(options);

        document.removeEventListener('selectionchange', this.debounceHandleSelectionChange);
        ownerDocument.addEventListener('selectionchange', this.debounceHandleSelectionChange);
        this.ownerDocument = ownerDocument;
    }

    destroy(): void {
        super.destroy();

        this.debounceHandleSelectionChange.cancel();
        this.ownerDocument.removeEventListener('selectionchange', this.debounceHandleSelectionChange);
    }
}

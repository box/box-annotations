import HtmlHighlightListener from '../HtmlHighlightListener';
import { createStore } from '../../store';

describe('html/HtmlHighlightListener', () => {
    let iframe: HTMLIFrameElement;
    let frameDocument: Document;

    beforeEach(() => {
        iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        frameDocument = iframe.contentDocument as Document;
        jest.spyOn(document, 'removeEventListener');
        jest.spyOn(frameDocument, 'addEventListener');
        jest.spyOn(frameDocument, 'removeEventListener');
    });

    afterEach(() => {
        iframe.remove();
    });

    test('should listen for selectionchange on the content document instead of this page', () => {
        const listener = new HtmlHighlightListener({
            getSelection: jest.fn(),
            ownerDocument: frameDocument,
            store: createStore(),
        });
        const handler = listener.debounceHandleSelectionChange;

        expect(document.removeEventListener).toHaveBeenCalledWith('selectionchange', handler);
        expect(frameDocument.addEventListener).toHaveBeenCalledWith('selectionchange', handler);

        listener.destroy();

        expect(frameDocument.removeEventListener).toHaveBeenCalledWith('selectionchange', handler);
    });
});

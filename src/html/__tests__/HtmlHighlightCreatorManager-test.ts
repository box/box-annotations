import HtmlHighlightCreatorManager from '../HtmlHighlightCreatorManager';
import { createStore } from '../../store';

describe('html/HtmlHighlightCreatorManager', () => {
    let iframe: HTMLIFrameElement;
    let frameDocument: Document;
    let manager: HtmlHighlightCreatorManager;

    beforeEach(() => {
        iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        frameDocument = iframe.contentDocument as Document;

        manager = new HtmlHighlightCreatorManager({
            getSelection: jest.fn(),
            referenceEl: frameDocument.body,
            store: createStore(),
        });
        jest.spyOn(manager, 'handleMouseUp');
    });

    afterEach(() => {
        manager.destroy();
        iframe.remove();
    });

    test('should listen for mouseup on the content document instead of this page', () => {
        jest.spyOn(document, 'addEventListener');
        jest.spyOn(document, 'removeEventListener');
        jest.spyOn(frameDocument, 'addEventListener');

        manager.render();

        expect(frameDocument.addEventListener).toHaveBeenCalledWith('mouseup', manager.handleMouseUp);
        expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', manager.handleMouseUp);
    });

    test('should stop listening on the content document on destroy', () => {
        jest.spyOn(frameDocument, 'removeEventListener');

        manager.render();
        manager.destroy();

        expect(frameDocument.removeEventListener).toHaveBeenCalledWith('mouseup', manager.handleMouseUp);
    });
});

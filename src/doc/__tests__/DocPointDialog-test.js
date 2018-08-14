/* eslint-disable no-unused-expressions */
import DocPointDialog from '../DocPointDialog';
import * as util from '../../util';
import { SELECTOR_ANNOTATED_ELEMENT } from '../../constants';

let dialog;
const html = '<div class="annotated-element"></div>';

describe('doc/DocPointDialog', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        dialog = new DocPointDialog({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            location: {},
            annotations: [],
            canAnnotate: true
        });
        dialog.localized = { addCommentPlaceholder: 'placeholder' };
        dialog.setup();
        dialog.threadEl = {
            offsetLeft: 1,
            offsetTop: 2
        };
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        if (typeof dialog.destroy === 'function') {
            dialog.destroy();
            dialog = null;
        }
    });

    describe('position()', () => {
        it('should position the dialog at the right place and show it', () => {
            util.showElement = jest.fn();
            util.repositionCaret = jest.fn();
            dialog.flipDialog = jest.fn().mockReturnValue([]);

            dialog.position();

            expect(util.repositionCaret).toBeCalled();
            expect(util.showElement).toBeCalled();
            expect(dialog.flipDialog).toBeCalled();
        });
    });
});

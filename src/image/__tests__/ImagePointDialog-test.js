/* eslint-disable no-unused-expressions */
import ImagePointDialog from '../ImagePointDialog';
import * as util from '../../util';
import { SELECTOR_ANNOTATED_ELEMENT } from '../../constants';

let dialog;
const html = `<div class="annotated-element ba-annotated">
    <img width="400px" height="600px" data-page-number="1">
    <div data-type="annotation-dialog" class="ba-annotation-dialog">
        <div class="ba-annotation-caret"></div>
    </div>
</div>
`;

describe('image/ImagePointDialog', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        dialog = new ImagePointDialog({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            location: {
                page: 1
            },
            annotations: [],
            canAnnotate: true
        });
        dialog.localized = { addCommentPlaceholder: 'placeholder' };
        dialog.setup();
        dialog.element.style.width = '282px';
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
            dialog.container = { clientHeight: 1 };
            util.repositionCaret = jest.fn();
            util.showElement = jest.fn();
            dialog.flipDialog = jest.fn().mockReturnValue([]);

            dialog.position();

            expect(util.repositionCaret).toBeCalled();
            expect(util.showElement).toBeCalled();
            expect(dialog.flipDialog).toBeCalled();
        });
    });
});

/* eslint-disable no-unused-expressions */
import ImagePointDialog from '../ImagePointDialog';
import * as util from '../../util';

let dialog;
const html = `<div class="annotated-element ba-annotated">
    <img width="400px" height="600px" data-page-Number="1">
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
            annotatedElement: rootElement,
            location: {
                page: 1
            },
            annotations: [],
            canAnnotate: true,
            locale: 'en-US'
        });
        dialog.localized = { addCommentPlaceholder: 'placeholder' };
        dialog.threadEl = document.createElement('button');
        dialog.element = document.createElement('div');
        dialog.dialogEl = document.createElement('div');
        dialog.element.style.width = '282px';
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

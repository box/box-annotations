/* eslint-disable no-unused-expressions */
import DocPointDialog from '../DocPointDialog';
import * as util from '../../util';

let dialog;

describe('doc/DocPointDialog', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        document.body.appendChild(rootElement);

        dialog = new DocPointDialog({
            annotatedElement: rootElement,
            location: {},
            locale: 'en-US',
            annotations: [],
            canAnnotate: true
        });
        dialog.localized = { addCommentPlaceholder: 'placeholder' };
        dialog.threadEl = document.createElement('button');
        dialog.element = document.createElement('div');
        dialog.dialogEl = document.createElement('div');
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

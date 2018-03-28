/* eslint-disable no-unused-expressions */
import ImagePointDialog from '../ImagePointDialog';
import * as util from '../../util';
import * as imageUtil from '../imageUtil';

let dialog;
const sandbox = sinon.sandbox.create();

const SELECTOR_ANNOTATED_ELEMENT = '.annotated-element';

describe('image/ImagePointDialog', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('image/__tests__/ImagePointDialog-test.html');

        dialog = new ImagePointDialog({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            location: {
                page: 1
            },
            annotations: [],
            canAnnotate: true
        });
        dialog.localized = { addCommentPlaceholder: 'placeholder' };
        dialog.setup([]);
        dialog.element.style.width = '282px';
        dialog.threadEl = {
            offsetLeft: 1,
            offsetTop: 2
        };
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        if (typeof dialog.destroy === 'function') {
            dialog.destroy();
            dialog = null;
        }
    });

    describe('position()', () => {
        it('should position the dialog at the right place and show it', () => {
            dialog.container = { clientHeight: 1 };
            sandbox.stub(util, 'repositionCaret');
            sandbox.stub(util, 'showElement');
            sandbox.stub(dialog, 'flipDialog').returns([]);

            dialog.position();

            expect(util.repositionCaret).to.be.called;
            expect(util.showElement).to.be.called;
            expect(dialog.flipDialog).to.be.called;
        });
    });
});

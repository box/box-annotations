/* eslint-disable no-unused-expressions */
import DocPointDialog from '../DocPointDialog';
import * as util from '../../util';
import * as docUtil from '../docUtil';

let dialog;
const sandbox = sinon.sandbox.create();

const SELECTOR_ANNOTATED_ELEMENT = '.annotated-element';

describe('doc/DocPointDialog', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('doc/__tests__/DocPointDialog-test.html');

        dialog = new DocPointDialog({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            location: {},
            annotations: [],
            canAnnotate: true
        });
        dialog.localized = { addCommentPlaceholder: 'placeholder' };
        dialog.setup([]);
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
            sandbox.stub(util, 'showElement');
            sandbox.stub(util, 'repositionCaret');
            sandbox.stub(dialog, 'flipDialog').returns([]);

            dialog.position();

            expect(util.repositionCaret).to.be.called;
            expect(util.showElement).to.be.called;
            expect(dialog.flipDialog).to.be.called;
        });
    });
});

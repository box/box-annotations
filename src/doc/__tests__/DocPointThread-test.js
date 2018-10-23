/* eslint-disable no-unused-expressions */
import DocPointThread from '../DocPointThread';
import * as util from '../../util';
import * as docUtil from '../docUtil';
import { STATES, SELECTOR_ANNOTATED_ELEMENT } from '../../constants';

let thread;
const html = '<div class="annotated-element"></div>';

describe('doc/DocPointThread', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        thread = new DocPointThread({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            annotations: [],
            api: {},
            fileVersionId: 1,
            location: {},
            threadID: 2,
            type: 'point',
            permissions: {
                can_annotate: true
            }
        });
        thread.getPopoverParent = jest.fn().mockReturnValue(rootElement);
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        thread = null;
    });

    describe('show', () => {
        beforeEach(() => {
            util.showElement = jest.fn();
            thread.renderAnnotationPopover = jest.fn();
            docUtil.getBrowserCoordinatesFromLocation = jest.fn().mockReturnValue([1, 2]);
            thread.annotatedElement.querySelector = jest.fn().mockReturnValue(rootElement);
        });

        it('should show the thread', () => {
            thread.show();
            expect(docUtil.getBrowserCoordinatesFromLocation).toBeCalledWith(thread.location, thread.annotatedElement);
            expect(util.showElement).toBeCalledWith(thread.element);
        });

        it('should render the popover if the state is pending', () => {
            thread.state = STATES.pending;
            thread.show();
            expect(thread.renderAnnotationPopover).toBeCalled();
        });

        it('should not render the popover if the state is not pending', () => {
            thread.state = STATES.inactive;
            thread.show();
            expect(thread.renderAnnotationPopover).not.toBeCalled();
        });

        it('should not render popover if user is on a mobile device and the thread has no annotations yet', () => {
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(true);
            thread.comments = [];
            thread.state = STATES.inactive;
            thread.show();
            expect(thread.renderAnnotationPopover).not.toBeCalled();
        });
    });
});

/* eslint-disable no-unused-expressions */
import ImagePointThread from '../ImagePointThread';
import * as util from '../../util';
import { STATES, SELECTOR_ANNOTATED_ELEMENT, CLASS_FLIPPED_POPOVER } from '../../constants';
import * as imageUtil from '../imageUtil';

let thread;
const html = `<div class="annotated-element" data-page-number="1">
    <img width="100px" height="200px">
    <button class="ba-point-annotation-marker"></button>
</div>
`;

describe('image/ImagePointThread', () => {
    let rootElement;
    let container;
    let annotatedElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        container = document.createElement('div');
        container.classList.add('container');

        annotatedElement = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);

        thread = new ImagePointThread({
            annotatedElement,
            annotations: [],
            api: {},
            container,
            fileVersionId: 1,
            location: {},
            threadID: 2,
            type: 'point',
            permissions: {
                can_annotate: true,
            },
        });
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
    });

    describe('show', () => {
        beforeEach(() => {
            util.showElement = jest.fn();
            thread.renderAnnotationPopover = jest.fn();
            imageUtil.getBrowserCoordinatesFromLocation = jest.fn().mockReturnValue([1, 2]);
        });

        it('should show the thread', () => {
            thread.show();
            expect(imageUtil.getBrowserCoordinatesFromLocation).toBeCalledWith(
                thread.location,
                thread.annotatedElement,
            );
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
    });

    describe('position()', () => {
        beforeEach(() => {
            util.findElement = jest.fn().mockReturnValue(rootElement);
            thread.getPopoverParent = jest.fn().mockReturnValue(rootElement);
            util.repositionCaret = jest.fn().mockReturnValue(0);
            thread.scrollIntoView = jest.fn();
        });

        it('should position desktop popovers', () => {
            util.isInUpperHalf = jest.fn().mockReturnValue(true);
            thread.position();
            expect(util.findElement).toBeCalled();
            expect(rootElement.classList).not.toContain(CLASS_FLIPPED_POPOVER);
            expect(thread.scrollIntoView).toBeCalled();
        });

        it('should flip popovers in the lower half of the viewport', () => {
            util.isInUpperHalf = jest.fn().mockReturnValue(false);
            thread.position();
            expect(util.findElement).toBeCalled();
            expect(rootElement.classList).toContain(CLASS_FLIPPED_POPOVER);
            expect(thread.scrollIntoView).toBeCalled();
        });
    });
});

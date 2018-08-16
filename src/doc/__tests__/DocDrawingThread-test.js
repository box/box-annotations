/* eslint-disable no-unused-expressions */
import * as docUtil from '../docUtil';
import * as util from '../../util';
import DocDrawingThread from '../DocDrawingThread';
import DocDrawingDialog from '../DocDrawingDialog';
import AnnotationThread from '../../AnnotationThread';
import DrawingPath from '../../drawing/DrawingPath';
import { DRAW_STATES, STATES } from '../../constants';

let thread;

const html = '<div class="page-element" id="doc-page-el" data-page=1></div>';

describe('doc/DocDrawingThread', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        thread = new DocDrawingThread({
            annotationService: {
                user: {
                    id: -1
                }
            }
        });
        thread.location = {
            x: 0,
            y: 0,
            page: thread.page
        };
        thread.getThreadEventData = jest.fn();
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        thread.destroy();
        thread = null;
    });

    describe('handleMove()', () => {
        beforeEach(() => {
            thread.drawingFlag = DRAW_STATES.drawing;
            thread.pageEl = document.querySelector('.page-element');
            thread.page = thread.pageEl.getAttribute('page');
            thread.pendingPath = {
                addCoordinate: jest.fn(),
                isEmpty: jest.fn()
            };
            const { location } = thread;

            docUtil.getBrowserCoordinatesFromLocation = jest.fn().mockReturnValue([location.x, location.y]);
        });

        it('should not add a coordinate when the state is not \'draw\'', () => {
            thread.drawingFlag = DRAW_STATES.idle;
            thread.handleMove(thread.location);

            expect(thread.pendingPath.addCoordinate).not.toBeCalled();
        });

        it('should add a coordinate frame when the state is \'draw\'', () => {
            thread.hasPageChanged = jest.fn().mockReturnValue(false);
            thread.handleMove(thread.location);

            expect(thread.hasPageChanged).toBeCalled();
            expect(thread.pendingPath.addCoordinate).toBeCalled();
        });

        it('should do nothing when location is empty', () => {
            thread.hasPageChanged = jest.fn().mockReturnValue(false);

            thread.handleMove(undefined);
            expect(thread.hasPageChanged).not.toBeCalled();
        });

        it('should only handle page change when the page changes', () => {
            thread.hasPageChanged = jest.fn().mockReturnValue(true);
            thread.onPageChange = jest.fn();

            thread.handleMove({ page: 1 });
            expect(thread.onPageChange).toBeCalled();
        });
    });

    describe('handleStart()', () => {
        beforeEach(() => {
            window.requestAnimationFrame = jest.fn();
            thread.checkAndHandleScaleUpdate = jest.fn();
            thread.onPageChange = jest.fn();
            thread.hasPageChanged = jest.fn();

            const context = 'I\'m a real context';
            docUtil.getPageEl = jest.fn().mockReturnValue(context);
        });

        it('should do nothing if no location is provided', () => {
            thread.handleStart();
            expect(thread.hasPageChanged).not.toBeCalled();
            expect(thread.state).toEqual(STATES.inactive);
        });

        it('should set the drawingFlag, pendingPath, and context if they do not exist', () => {
            thread.hasPageChanged.mockReturnValue(false);
            thread.drawingFlag = DRAW_STATES.idle;
            thread.pendingPath = undefined;
            expect(thread.state).toEqual(STATES.inactive);
            thread.handleStart(thread.location);

            expect(window.requestAnimationFrame).toBeCalled();
            expect(thread.drawingFlag).toEqual(DRAW_STATES.drawing);
            expect(thread.hasPageChanged).toBeCalled();
            expect(thread.checkAndHandleScaleUpdate).toBeCalled();
            expect(thread.pendingPath).toBeInstanceOf(DrawingPath);
            expect(thread.state).toEqual(STATES.pending);
        });

        it('should commit the thread when the page changes', () => {
            thread.hasPageChanged.mockReturnValue(true);

            thread.pendingPath = undefined;
            thread.location = {};
            thread.handleStart(thread.location);

            expect(thread.hasPageChanged).toBeCalled();
            expect(thread.onPageChange).toBeCalled();
            expect(thread.checkAndHandleScaleUpdate).not.toBeCalled();
            expect(thread.state).toEqual(STATES.inactive);
        });
    });

    describe('handleStop()', () => {
        beforeEach(() => {
            thread.emitAvailableActions = jest.fn();
            thread.updateBoundary = jest.fn();
            thread.regenerateBoundary = jest.fn();
            thread.render = jest.fn();
            thread.createDialog = jest.fn();
            thread.drawingFlag = DRAW_STATES.drawing;
            thread.pendingPath = {
                isEmpty: () => false
            };
            thread.pathContainer = {
                insert: jest.fn(),
                isEmpty: jest.fn().mockReturnValue(false)
            };
        });

        it('should set the state to \'idle\' and clear the pendingPath', () => {
            thread.handleStop();

            expect(thread.emitAvailableActions).toBeCalled();
            expect(thread.updateBoundary).toBeCalled();
            expect(thread.regenerateBoundary).toBeCalled();
            expect(thread.render).toBeCalled();
            expect(thread.createDialog).toBeCalled();
            expect(thread.pathContainer.insert).toBeCalled();
            expect(thread.drawingFlag).toEqual(DRAW_STATES.idle);
            expect(thread.pendingPath).toBeNull();
        });

        it('should not create a dialog if one already exists', () => {
            thread.dialog = {
                value: 'non-empty',
                removeAllListeners: jest.fn(),
                destroy: jest.fn(),
                isVisible: jest.fn().mockReturnValue(false)
            };

            thread.handleStop();
            expect(thread.createDialog).not.toBeCalled();
        });
    });

    describe('onPageChange()', () => {
        it('should emit an annotationevent of type pagechanged and stop a pending drawing', (done) => {
            thread.handleStop = jest.fn();
            const location = 'location';
            thread.addListener('threadevent', () => {
                done();
            });

            thread.onPageChange(location);
            expect(thread.handleStop).toBeCalled();
        });
    });

    describe('checkAndHandleScaleUpdate()', () => {
        it('should update the drawing information when the scale has changed', () => {
            thread.setContextStyles = jest.fn();
            util.getScale = jest.fn().mockReturnValue(1.4);
            docUtil.getPageEl = jest.fn();
            docUtil.getContext = jest.fn();
            thread.lastScaleFactor = 1.1;
            thread.location = {
                page: 1
            };
            thread.checkAndHandleScaleUpdate();
            expect(thread.lastScaleFactor).toEqual(1.4);
            expect(util.getScale).toBeCalled();
            expect(docUtil.getPageEl).toBeCalled();
            expect(docUtil.getContext).toBeCalled();
            expect(thread.setContextStyles).toBeCalled();
        });

        it('should do nothing when the scale has not changed', () => {
            util.getScale = jest.fn().mockReturnValue(1.4);
            docUtil.getPageEl = jest.fn();
            thread.lastScaleFactor = 1.4;
            thread.checkAndHandleScaleUpdate();
            expect(util.getScale).toBeCalled();
            expect(docUtil.getPageEl).not.toBeCalled();
        });
    });

    describe('reconstructBrowserCoordFromLocation()', () => {
        it('should return a browser coordinate when the DocDrawingThread has been assigned a page', () => {
            thread.pageEl = 'has been set';
            thread.location = {
                dimensions: 'has been set'
            };
            const documentLocation = {
                x: 1,
                y: 2
            };

            docUtil.getBrowserCoordinatesFromLocation = jest.fn().mockReturnValue([3, 4]);
            const returnValue = thread.reconstructBrowserCoordFromLocation(documentLocation);

            expect(returnValue).toStrictEqual({
                x: 3,
                y: 4
            });
        });
    });

    describe('saveAnnotation()', () => {
        const resetValue = AnnotationThread.prototype.saveAnnotation;

        beforeEach(() => {
            thread.regenerateBoundary = jest.fn();
            thread.show = jest.fn();
            thread.createDialog = jest.fn();
            Object.defineProperty(AnnotationThread.prototype, 'saveAnnotation', { value: jest.fn() });
        });

        afterEach(() => {
            Object.defineProperty(AnnotationThread.prototype, 'saveAnnotation', { value: resetValue });
        });

        it('should clean up without committing when there are no paths to be saved', () => {
            thread.reset = jest.fn();
            thread.pathContainer = {
                isEmpty: jest.fn().mockReturnValue(true)
            };

            thread.saveAnnotation('draw');
            expect(thread.pathContainer.isEmpty).toBeCalled();
            expect(AnnotationThread.prototype.saveAnnotation).not.toBeCalled();
            expect(thread.reset).toBeCalled();
            expect(thread.show).not.toBeCalled();
            expect(thread.createDialog).not.toBeCalled();
        });

        it('should clean up and commit in-progress drawings when there are paths to be saved', () => {
            thread.drawingContext = {
                canvas: {
                    style: {
                        width: 10,
                        height: 15
                    }
                },
                width: 20,
                height: 30,
                clearRect: jest.fn()
            };
            thread.pathContainer = {
                isEmpty: jest.fn().mockReturnValue(false)
            };

            thread.saveAnnotation('draw');
            expect(thread.pathContainer.isEmpty).toBeCalled();
            expect(thread.drawingContext.clearRect).toBeCalled();
            expect(AnnotationThread.prototype.saveAnnotation).toBeCalled();
            expect(thread.show).toBeCalled();
            expect(thread.regenerateBoundary).toBeCalled();
            expect(thread.createDialog).toBeCalled();
        });
    });

    describe('hasPageChanged()', () => {
        it('should return false when there is no location', () => {
            const value = thread.hasPageChanged();
            expect(value).toBeFalsy();
        });

        it('should return false when there is a location but no page', () => {
            const location = {
                page: undefined
            };
            const value = thread.hasPageChanged(location);
            expect(value).toBeFalsy();
        });

        it('should return false when the given location page is the same as the thread location', () => {
            thread.location = {
                page: 2
            };
            const location = {
                page: thread.location.page
            };
            const value = thread.hasPageChanged(location);
            expect(value).toBeFalsy();
        });

        it('should return true when the given location page is different from the thread location', () => {
            thread.location = {
                page: 2
            };
            const location = {
                page: thread.location.page + 1
            };
            const value = thread.hasPageChanged(location);
            expect(value).toBeTruthy();
        });
    });

    describe('show()', () => {
        beforeEach(() => {
            thread.selectContext = jest.fn();
            thread.draw = jest.fn();
            thread.pathContainer = {
                applyToItems: jest.fn()
            };

            thread.annotatedElement = 'annotatedEl';
            thread.location = 'loc';
        });

        it('should do nothing when no element is assigned to the DocDrawingThread', () => {
            thread.annotatedElement = undefined;
            thread.show();
            expect(thread.selectContext).not.toBeCalled();
        });

        it('should do nothing when no location is assigned to the DocDrawingThread', () => {
            thread.location = undefined;
            thread.show();
            expect(thread.selectContext).not.toBeCalled();
        });

        it('should draw the paths in the thread', () => {
            thread.state = 'not pending';
            thread.show();
            expect(thread.selectContext).toBeCalled();
            expect(thread.draw).toBeCalled();
        });

        it('should draw the boundary when a dialog exists and is visible', () => {
            thread.drawBoundary = jest.fn();
            thread.dialog = {
                isVisible: jest.fn().mockReturnValue(true),
                destroy: jest.fn(),
                removeAllListeners: jest.fn(),
                hide: jest.fn(),
                show: jest.fn()
            };

            thread.show();
            expect(thread.dialog.isVisible).toBeCalled();
            expect(thread.drawBoundary).toBeCalled();
            expect(thread.dialog.show).toBeCalled();
        });
    });

    describe('selectContext()', () => {
        beforeEach(() => {
            thread.checkAndHandleScaleUpdate = jest.fn();
            thread.setContextStyles = jest.fn();
            docUtil.getContext = jest.fn();
        });

        it('should return the pending drawing context when the state is pending', () => {
            thread.state = STATES.pending;
            thread.drawingContext = {
                clearRect: jest.fn(),
                canvas: {
                    height: 100,
                    width: 100
                }
            };

            const retValue = thread.selectContext();
            expect(thread.checkAndHandleScaleUpdate).toBeCalled();
            expect(docUtil.getContext).not.toBeCalled();
            expect(retValue).toStrictEqual(thread.drawingContext);
        });

        it('should set and return the concrete context when the state is not pending', () => {
            const concreteContext = {
                clearRect: jest.fn(),
                canvas: {
                    height: 100,
                    width: 100
                }
            };

            docUtil.getContext.mockReturnValue(concreteContext);
            thread.state = STATES.idle;

            const retValue = thread.selectContext();
            expect(thread.checkAndHandleScaleUpdate).toBeCalled();
            expect(thread.setContextStyles).toBeCalled();
            expect(docUtil.getContext).toBeCalled();
            expect(retValue).toStrictEqual(thread.concreteContext);
        });
    });

    describe('getBrowserRectangularBoundary()', () => {
        it('should return null when no thread has not been assigned a location', () => {
            thread.location = undefined;

            const value = thread.getBrowserRectangularBoundary();
            expect(value).toBeNull();
        });

        it('should return a starting coordinate along with a height and width', () => {
            thread.pageEl = 'page';
            thread.location = {
                dimensions: 'not empty'
            };

            util.createLocation = jest.fn();
            docUtil.getBrowserCoordinatesFromLocation = jest
                .fn()
                .mockReturnValueOnce([5, 5])
                .mockReturnValueOnce([50, 45]);

            const value = thread.getBrowserRectangularBoundary();
            expect(util.createLocation).toBeCalled.twice;
            expect(docUtil.getBrowserCoordinatesFromLocation).toHaveBeenCalledTimes(2);
            expect(value).toStrictEqual([5, 5, 45, 40]);
        });
    });

    describe('createDialog()', () => {
        it('should create a new doc drawing dialog', () => {
            const existingDialog = {
                destroy: jest.fn()
            };

            thread.bindCustomListenersOnDialog = jest.fn();
            thread.dialog = existingDialog;
            thread.annotationService = {
                canAnnotate: true,
                user: { id: -1 }
            };

            thread.createDialog();

            expect(existingDialog.destroy).toBeCalled();
            expect(thread.dialog instanceof DocDrawingDialog).toBeTruthy();
            expect(thread.bindCustomListenersOnDialog).toBeCalled();
        });
    });

    describe('bindCustomListenersOnDialog', () => {
        it('should bind listeners on the dialog', () => {
            thread.dialog = {
                addListener: jest.fn(),
                removeAllListeners: jest.fn(),
                hide: jest.fn(),
                destroy: jest.fn(),
                isVisible: jest.fn()
            };

            thread.bindCustomListenersOnDialog();
            expect(thread.dialog.addListener).toBeCalledWith('annotationcreate', expect.any(Function));
            expect(thread.dialog.addListener).toBeCalledWith('annotationdelete', expect.any(Function));
        });
    });
});

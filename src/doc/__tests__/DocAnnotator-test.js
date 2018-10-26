/* eslint-disable no-unused-expressions */
import rangy from 'rangy';
import Annotator from '../../Annotator';
import DocAnnotator from '../DocAnnotator';
import * as util from '../../util';
import * as docUtil from '../docUtil';
import {
    STATES,
    TYPES,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT,
    CONTROLLER_EVENT,
    CREATE_EVENT,
    SELECTOR_ANNOTATED_ELEMENT
} from '../../constants';
import DocHighlightThread from '../DocHighlightThread';
import FileVersionAPI from '../../api/FileVersionAPI';
import AnnotationModeController from '../../controllers/AnnotationModeController';
import CreateHighlightDialog from '../CreateHighlightDialog';

jest.mock('../DocHighlightThread');
jest.mock('../../api/FileVersionAPI');
jest.mock('../../controllers/AnnotationModeController');
jest.mock('../CreateHighlightDialog');

let annotator;
let thread;
let controller;
let api;
const html = '<div class="bp-doc annotated-element" id="doc-annotator-el"></div>';

const SELECTOR_DEFAULT_CURSOR = '.bp-use-default-cursor';

describe('doc/DocAnnotator', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        thread = new DocHighlightThread();
        thread.threadID = '123abc';
        thread.location = { page: 1 };
        thread.state = STATES.pending;
        thread.type = TYPES.highlight;

        controller = new AnnotationModeController();

        const options = {
            annotator: {
                NAME: 'name',
                TYPE: ['highlight', 'highlight-comment'],
                CONTROLLERS: { something: controller }
            }
        };

        api = new FileVersionAPI();
        annotator = new DocAnnotator({
            container: rootElement,
            api,
            file: {
                file_version: { id: 1 }
            },
            isMobile: false,
            options,
            modeButtons: {},
            location: {
                locale: 'en-US'
            },
            localizedStrings: {
                anonymousUserName: 'anonymous',
                loadError: 'loaderror'
            }
        });

        annotator.headerElement = document.createElement('div');
        annotator.annotatedElement = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
        annotator.threads = {};
        annotator.modeControllers = {};
        annotator.permissions = annotator.getAnnotationPermissions(annotator.options.file);
        annotator.emit = jest.fn();

        util.getPageInfo = jest.fn();
        annotator.createHighlightDialog = new CreateHighlightDialog();

        annotator.destroy = jest.fn();

        util.getPageInfo = jest.fn().mockReturnValue({
            page: 1,
            pageEl: document.createElement('div')
        });
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        annotator.threads = {};
        annotator.modeButtons = {};
        annotator.modeControllers = {};

        annotator.annotatedElement = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
        if (typeof annotator.destroy === 'function') {
            annotator = null;
        }
    });

    describe('init()', () => {
        it('should add ID to annotatedElement add createHighlightDialog init listener', () => {
            annotator.setupAnnotations = jest.fn();
            annotator.init(1);
            expect(annotator.annotatedElement.id).not.toBeUndefined();
        });
    });

    describe('getAnnotatedEl()', () => {
        it('should return the annotated element as the document', () => {
            expect(annotator.annotatedElement).not.toBeNull();
        });
    });

    describe('getLocationFromEvent()', () => {
        const x = 100;
        const y = 200;
        const dimensions = { x, y };
        const quadPoints = [[1, 2, 3, 4, 5, 6, 7, 8], [2, 3, 4, 5, 6, 7, 8, 9]];
        const page = 3;
        let event;
        let pageEl;

        beforeEach(() => {
            event = {
                clientX: x,
                clientY: y,
                target: annotator.annotatedEl
            };

            docUtil.isSelectionPresent = jest.fn().mockReturnValue(true);
            pageEl = {
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: dimensions.x,
                    height: dimensions.y + 30, // 15px padding top and bottom,
                    top: 0,
                    left: 0
                })
            };
            util.getPageInfo = jest.fn().mockReturnValue({ pageEl, page });

            docUtil.getHighlightAndHighlightEls = jest.fn().mockReturnValue({
                highlight: {},
                highlightEls: []
            });

            util.isInDialog = jest.fn().mockReturnValue(false);
            util.getScale = jest.fn().mockReturnValue(1);

            // stub highlight methods
            docUtil.getQuadPoints = jest.fn();
            window.getSelection = jest.fn().mockReturnValue({});
            rangy.saveSelection = jest.fn();
            rangy.restoreSelection = jest.fn();
            annotator.removeRangyHighlight = jest.fn();
        });

        it('should replace event with mobile touch event if user is on a touch enabled device', () => {
            annotator.hasTouch = true;
            event = {
                targetTouches: [
                    {
                        clientX: x,
                        clientY: y,
                        target: annotator.annotatedEl
                    }
                ]
            };
            annotator.getLocationFromEvent(event, TYPES.point);
        });

        it('should not return a location if there are no touch event and the user is on a touch enabled device', () => {
            annotator.hasTouch = true;
            expect(annotator.getLocationFromEvent(event, TYPES.point)).toBeNull();

            event = {
                targetTouches: [
                    {
                        target: annotator.annotatedEl
                    }
                ]
            };
            annotator;
            expect(annotator.getLocationFromEvent(event, TYPES.point)).toBeNull();
        });

        it('should not return a location if click isn\'t on page', () => {
            window.getSelection = jest.fn().mockReturnValue(false);
            util.getPageInfo = jest.fn().mockReturnValue({ pageEl: null, page: -1 });
            expect(annotator.getLocationFromEvent(event, TYPES.point)).toBeNull();
        });

        describe(TYPES.point, () => {
            it('should not return a location if there is a selection present', () => {
                expect(annotator.getLocationFromEvent(event, TYPES.point)).toBeNull();
            });

            it('should not return a location if click is on dialog', () => {
                docUtil.getSelection = jest.fn().mockReturnValue(false);
                util.getPageInfo = jest.fn().mockReturnValue({
                    pageEl: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                    page: 1
                });
                util.isInDialog = jest.fn().mockReturnValue(true);
                expect(annotator.getLocationFromEvent(event, TYPES.point)).toBeNull();
            });

            it('should not return a location if click event does not have coordinates', () => {
                docUtil.getSelection = jest.fn().mockReturnValue(false);
                util.findClosestDataType = jest.fn().mockReturnValue('not-a-dialog');
                docUtil.convertDOMSpaceToPDFSpace = jest.fn();

                expect(annotator.getLocationFromEvent({}, TYPES.point)).toBeNull();
                expect(docUtil.convertDOMSpaceToPDFSpace).not.toBeCalled();
            });

            it('should not return a location if click event is outside the doc', () => {
                docUtil.getSelection = jest.fn().mockReturnValue(false);
                util.findClosestDataType = jest.fn().mockReturnValue('not-a-dialog');
                annotator.hasTouch = true;
                event = {
                    targetTouches: [
                        {
                            clientX: x + 1,
                            clientY: y,
                            target: annotator.annotatedEl
                        }
                    ]
                };

                expect(annotator.getLocationFromEvent(event, TYPES.point)).toBeNull();
            });

            it('should return a valid point location if click is valid', () => {
                docUtil.isSelectionPresent = jest.fn().mockReturnValue(false);
                util.findClosestDataType = jest.fn().mockReturnValue('not-a-dialog');
                docUtil.convertDOMSpaceToPDFSpace = jest.fn().mockReturnValue([x, y]);

                const location = annotator.getLocationFromEvent(event, TYPES.point);
                expect(location).toStrictEqual({ x, y, page, dimensions });
            });
        });

        describe(TYPES.highlight, () => {
            beforeEach(() => {
                annotator.highlighter = {
                    highlights: []
                };
            });

            it('should not return a location if there is no selection present', () => {
                expect(annotator.getLocationFromEvent(event, TYPES.highlight)).toBeNull();
            });

            it('should infer page from selection if it cannot be inferred from event', () => {
                annotator.highlighter.highlights = [{}, {}];
                util.getPageInfo = jest.fn().mockReturnValue({ pageEl: null, page: -1 });

                annotator.getLocationFromEvent(event, TYPES.highlight);
                expect(util.getPageInfo).toBeCalled();
            });

            it('should not return a valid highlight location if no highlights exist', () => {
                expect(annotator.getLocationFromEvent(event, TYPES.highlight)).toStrictEqual(null);
            });

            it('should return a valid highlight location if selection is valid', () => {
                annotator.highlighter.highlights = [{}];
                docUtil.getQuadPoints = jest
                    .fn()
                    .mockReturnValueOnce(quadPoints[0])
                    .mockReturnValueOnce(quadPoints[1]);

                docUtil.getHighlightAndHighlightEls = jest
                    .fn()
                    .mockReturnValue({ highlight: {}, highlightEls: [{}, {}] });

                const location = annotator.getLocationFromEvent(event, TYPES.highlight);
                expect(location).toStrictEqual({ page, quadPoints, dimensions });
            });
        });

        describe(TYPES.highlight_comment, () => {
            beforeEach(() => {
                annotator.highlighter = {
                    highlights: []
                };
            });

            it('should not return a location if there is no selection present', () => {
                expect(annotator.getLocationFromEvent(event, TYPES.highlight_comment)).toBeNull();
            });

            it('should infer page from selection if it cannot be inferred from event', () => {
                annotator.highlighter.highlights = [{}, {}];
                util.getPageInfo = jest.fn().mockReturnValue({ pageEl: null, page: -1 });

                annotator.getLocationFromEvent(event, TYPES.highlight_comment);
                expect(util.getPageInfo).toBeCalled();
            });

            it('should not return a valid highlight location if no highlights exist', () => {
                annotator.highlighter.highlights = [{}];
                expect(annotator.getLocationFromEvent(event, TYPES.highlight_comment)).toStrictEqual(null);
            });

            it('should return a valid highlight location if selection is valid', () => {
                annotator.highlighter.highlights = [{}];
                docUtil.getQuadPoints = jest
                    .fn()
                    .mockReturnValueOnce(quadPoints[0])
                    .mockReturnValueOnce(quadPoints[1]);

                docUtil.getHighlightAndHighlightEls = jest
                    .fn()
                    .mockReturnValue({ highlight: {}, highlightEls: [{}, {}] });

                const location = annotator.getLocationFromEvent(event, TYPES.highlight_comment);
                expect(location).toStrictEqual({ page, quadPoints, dimensions });
            });
        });
    });

    describe('createPlainHighlight()', () => {
        beforeEach(() => {
            annotator.highlightCurrentSelection = jest.fn();
            annotator.createHighlightThread = jest.fn();
            annotator.createPlainHighlight();
        });

        it('should invoke highlightCurrentSelection()', () => {
            expect(annotator.highlightCurrentSelection).toBeCalled();
        });

        it('should invoke createHighlightThread', () => {
            expect(annotator.createHighlightThread).toBeCalled();
        });
    });

    describe('createHighlightThread()', () => {
        beforeEach(() => {
            annotator.getLocationFromEvent = jest.fn();
            annotator.resetHighlightSelection = jest.fn();
            annotator.renderPage = jest.fn();
            annotator.lastHighlightEvent = {};

            annotator.highlighter = {
                removeAllHighlights: jest.fn()
            };

            thread.type = 'highlight';
            controller.registerThread = jest.fn().mockReturnValue(thread);
            annotator.modeControllers = {
                highlight: controller,
                highlight_comment: controller
            };
        });

        it('should do nothing and return null if empty string passed in', () => {
            expect(annotator.createHighlightThread('')).toBeNull();
            expect(annotator.createHighlightDialog.unmountPopover).not.toBeCalled();
        });

        it('should hide the dialog if it exists and is visible', () => {
            annotator.createHighlightDialog.isVisible = true;
            expect(annotator.createHighlightThread('some text')).toBeNull();
            expect(annotator.createHighlightDialog.unmountPopover).toBeCalled();
        });

        it('should do nothing and return null if there was no highlight event on the previous action', () => {
            annotator.lastHighlightEvent = null;
            expect(annotator.createHighlightThread('some text')).toBeNull();
            expect(annotator.createHighlightDialog.unmountPopover).not.toBeCalled();
        });

        it('should do nothing and return null if not a valid annotation location', () => {
            annotator.getLocationFromEvent = jest.fn().mockReturnValue(null);
            expect(annotator.createHighlightThread('some text')).toBeNull();
            expect(controller.registerThread).not.toBeCalled();
        });

        it('should bail out of making an annotation if thread is null', () => {
            const location = { page: 1 };
            controller.registerThread = jest.fn().mockReturnValue(null);
            annotator.getLocationFromEvent = jest.fn().mockReturnValue(location);
            expect(annotator.createHighlightThread('some text')).toBeNull();
        });

        it('should not register the thread if there is no appropriate controller', () => {
            const location = { page: 1 };
            annotator.getLocationFromEvent = jest.fn().mockReturnValue(location);
            annotator.modeControllers = { random: controller };
            expect(annotator.createHighlightThread()).toBeNull();
            expect(controller.registerThread).not.toBeCalled();
        });

        it('should register, show and return an annotation thread', () => {
            const page = 999999999;
            const location = { page };
            annotator.getLocationFromEvent = jest.fn().mockReturnValue(location);
            annotator.modeControllers = { highlight: controller };
            expect(annotator.createHighlightThread()).toStrictEqual(thread);
            expect(controller.registerThread).toBeCalled();
        });
    });

    describe('renderPage()', () => {
        beforeEach(() => {
            annotator.scaleAnnotationCanvases = jest.fn();
            annotator.modeControllers = {
                type: {
                    renderPage: jest.fn()
                },
                type2: {
                    renderPage: jest.fn()
                }
            };
        });

        it('should clear and hide createHighlightDialog on page render', () => {
            annotator.createHighlightDialog = {
                isVisible: true,
                hide: jest.fn(),
                destroy: jest.fn(),
                unmountPopover: jest.fn()
            };
            annotator.renderPage(1);
            expect(annotator.scaleAnnotationCanvases).toBeCalledWith(1);
            expect(annotator.modeControllers.type.renderPage).toBeCalledWith(1);
            expect(annotator.modeControllers.type2.renderPage).toBeCalledWith(1);
            expect(annotator.createHighlightDialog.unmountPopover).toBeCalled();
        });
    });

    describe('scaleAnnotationCanvases()', () => {
        let pageEl;

        beforeEach(() => {
            docUtil.scaleCanvas = jest.fn();

            // Add pageEl
            pageEl = document.createElement('div');
            pageEl.setAttribute('data-page-number', 1);
            annotator.annotatedElement.appendChild(pageEl);
        });

        it('should do nothing if annotation layer is not present', () => {
            annotator.scaleAnnotationCanvases(1);
            expect(docUtil.scaleCanvas).not.toBeCalled();
        });

        it('should scale canvas if annotation layer is present', () => {
            const annotationLayerEl = document.createElement('canvas');
            annotationLayerEl.classList.add(CLASS_ANNOTATION_LAYER_HIGHLIGHT);
            pageEl.appendChild(annotationLayerEl);

            annotator.scaleAnnotationCanvases(1);
            expect(docUtil.scaleCanvas).toBeCalledOnce;
        });
    });

    describe('setupAnnotations()', () => {
        const setupFunc = Annotator.prototype.setupAnnotations;
        const highlighter = { addClassApplier: jest.fn() };

        beforeEach(() => {
            Object.defineProperty(Annotator.prototype, 'setupAnnotations', { value: jest.fn() });
            rangy.createClassApplier = jest.fn();
            rangy.createHighlighter = jest.fn().mockReturnValue(highlighter);

            annotator.createHighlightDialog = {
                addListener: jest.fn()
            };
        });

        afterEach(() => {
            Object.defineProperty(Annotator.prototype, 'setupAnnotations', { value: setupFunc });
        });

        it('should not bind any plain highlight functions if they are disabled', () => {
            expect(annotator.createHighlightDialog.addListener).not.toBeCalledWith(
                CREATE_EVENT.plain,
                expect.any(Function)
            );
        });

        it('should not bind any comment highlight functions if they are disabled', () => {
            expect(annotator.createHighlightDialog.addListener).not.toBeCalledWith(
                CREATE_EVENT.comment,
                expect.any(Function)
            );
            expect(annotator.createHighlightDialog.addListener).not.toBeCalledWith(
                CREATE_EVENT.post,
                expect.any(Function)
            );
        });

        it('should call parent to setup annotations and initialize highlighter', () => {
            annotator.plainHighlightEnabled = true;
            annotator.setupAnnotations();
            expect(highlighter.addClassApplier).toBeCalled();
        });
    });

    describe('bindDOMListeners()', () => {
        const bindFunc = Annotator.prototype.bindDOMListeners;

        beforeEach(() => {
            Object.defineProperty(Annotator.prototype, 'bindDOMListeners', { value: jest.fn() });
            annotator.annotatedElement = {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };

            annotator.permissions.can_annotate = true;
            annotator.plainHighlightEnabled = true;
            annotator.drawEnabled = true;
            annotator.hasTouch = false;
        });

        afterEach(() => {
            Object.defineProperty(Annotator.prototype, 'bindDOMListeners', { value: bindFunc });
        });

        it('should bind DOM listeners if user can annotate and highlight', () => {
            annotator.bindDOMListeners();
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith(
                'mouseup',
                annotator.highlightMouseupHandler
            );
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith('wheel', annotator.hideCreateDialog);
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith(
                'dblclick',
                annotator.highlightMouseupHandler
            );
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith(
                'mousedown',
                annotator.highlightMousedownHandler
            );
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith(
                'contextmenu',
                annotator.highlightMousedownHandler
            );
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith('click', annotator.clickHandler);
        });

        it('should bind click handlers regardless of if the user can annotate ', () => {
            annotator.permissions.can_annotate = false;

            // Desktop draw selection handlers
            annotator.bindDOMListeners();
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith('click', annotator.clickHandler);

            // Mobile draw selection handlers
            annotator.hasTouch = true;
            annotator.bindDOMListeners();
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith('click', annotator.clickHandler);
        });

        it('should bind highlight mouse move handlers regardless of if the user can annotate only on desktop', () => {
            annotator.permissions.can_annotate = false;
            annotator.plainHighlightEnabled = true;
            annotator.commentHighlightEnabled = true;
            annotator.drawEnabled = false;

            annotator.bindDOMListeners();
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith('wheel', annotator.hideCreateDialog);
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith('click', annotator.clickHandler);
        });

        it('should bind selectionchange event on the document, if on a touch-enabled device and can annotate', () => {
            document.addEventListener = jest.fn();
            annotator.drawEnabled = true;
            annotator.hasTouch = true;
            annotator.bindDOMListeners();
            expect(document.addEventListener).toBeCalledWith('selectionchange', annotator.onSelectionChange);
        });

        it('should not bind selection change event if both annotation types are disabled, and touch enabled', () => {
            annotator.plainHighlightEnabled = false;
            annotator.commentHighlightEnabled = false;
            annotator.drawEnabled = true;

            document.addEventListener = jest.fn();

            annotator.bindDOMListeners();
            expect(document.addEventListener).not.toBeCalledWith('selectionchange', expect.any(Function));
        });

        it('should not bind selection change event if both annotation types are disabled, and touch disabled', () => {
            annotator.hasTouch = false;
            annotator.plainHighlightEnabled = false;
            annotator.commentHighlightEnabled = false;
            annotator.drawEnabled = true;

            annotator.bindDOMListeners();
            expect(annotator.annotatedElement.addEventListener).not.toBeCalledWith('wheel', annotator.hideCreateDialog);
            expect(annotator.annotatedElement.addEventListener).not.toBeCalledWith(
                'mouseup',
                annotator.highlightMouseupHandler
            );
            expect(annotator.annotatedElement.addEventListener).not.toBeCalledWith(
                'dblclick',
                annotator.highlightMouseupHandler
            );
            expect(annotator.annotatedElement.addEventListener).not.toBeCalledWith(
                'mousedown',
                annotator.highlightMousedownHandler
            );
            expect(annotator.annotatedElement.addEventListener).not.toBeCalledWith(
                'contextmenu',
                annotator.highlightMousedownHandler
            );
            expect(annotator.annotatedElement.addEventListener).toBeCalledWith('click', annotator.clickHandler);
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            annotator.annotatedElement = {
                removeEventListener: jest.fn()
            };
            annotator.highlightMousemoveHandler = jest.fn();

            annotator.hasTouch = false;
        });

        it('should unbind DOM listeners if user can annotate', () => {
            annotator.permissions.can_annotate = true;

            annotator.unbindDOMListeners();
            expect(annotator.annotatedElement.removeEventListener).toBeCalledWith(
                'mouseup',
                annotator.highlightMouseupHandler
            );
            expect(annotator.annotatedElement.removeEventListener).toBeCalledWith('wheel', annotator.hideCreateDialog);
            expect(annotator.annotatedElement.removeEventListener).toBeCalledWith(
                'contextmenu',
                annotator.highlightMousedownHandler
            );
            expect(annotator.annotatedElement.removeEventListener).toBeCalledWith(
                'touchend',
                annotator.hideCreateDialog
            );
            expect(annotator.annotatedElement.removeEventListener).toBeCalledWith(
                'dblclick',
                annotator.highlightMouseupHandler
            );
            expect(annotator.annotatedElement.removeEventListener).toBeCalledWith(
                'mousedown',
                annotator.highlightMousedownHandler
            );
            expect(annotator.annotatedElement.removeEventListener).toBeCalledWith('click', annotator.clickHandler);
        });

        it('should stop and destroy the requestAnimationFrame handle created by getHighlightMousemoveHandler()', () => {
            const rafHandle = 12; // RAF handles are integers
            annotator.permissions.can_annotate = true;
            annotator.highlightThrottleHandle = rafHandle;

            window.cancelAnimationFrame = jest.fn();
            annotator.unbindDOMListeners();

            expect(window.cancelAnimationFrame).toBeCalledWith(rafHandle);
            expect(annotator.highlightThrottleHandle).toBeNull();
        });

        it('should unbind selectionchange event, on the document, if on a touch-enabled device and can annotate', () => {
            annotator.permissions.can_annotate = true;
            document.removeEventListener = jest.fn();
            annotator.hasTouch = true;
            annotator.unbindDOMListeners();
            expect(document.removeEventListener).toBeCalledWith('selectionchange', expect.any(Function));
        });

        it('should tell controllers to clean up selections', () => {
            annotator.permissions.can_annotate = true;
            annotator.modeControllers = {
                test: {
                    removeSelection: jest.fn()
                }
            };

            annotator.unbindDOMListeners();
            expect(annotator.modeControllers.test.removeSelection).toBeCalled();
        });
    });

    describe('resetHighlightSelection()', () => {
        it('should hide the visible createHighlightDialog and clear the text selection', () => {
            const selection = {
                removeAllRanges: jest.fn()
            };
            document.getSelection = jest.fn().mockReturnValue(selection);
            annotator.hideCreateDialog = jest.fn();

            annotator.resetHighlightSelection({});
            expect(annotator.isCreatingHighlight).toBeFalsy();
            expect(selection.removeAllRanges).toBeCalled();
        });
    });

    describe('highlightCurrentSelection()', () => {
        beforeEach(() => {
            annotator.highlighter = {
                highlightSelection: jest.fn()
            };
        });

        it('should invoke highlighter.highlightSelection()', () => {
            annotator.highlightCurrentSelection();
            expect(annotator.highlighter.highlightSelection).toBeCalled();
        });

        it('should invoke highlighter.highlightSelection() with the annotated element\'s id', () => {
            annotator.highlightCurrentSelection();
            expect(annotator.highlighter.highlightSelection).toBeCalledWith('rangy-highlight', {
                containerElementId: 'doc-annotator-el'
            });
        });
    });

    describe('highlightMousedownHandler()', () => {
        beforeEach(() => {
            thread.type = 'highlight';
            controller.threads = { 1: { '123abc': thread } };
            annotator.modeControllers = {
                highlight: controller
            };
        });

        it('should do nothing if highlights are disabled', () => {
            annotator.highlightMousedownHandler({ clientX: 1, clientY: 1 });
            expect(thread.onMousedown).not.toBeCalled();
        });

        it('should get highlights on page and call their onMouse down method', () => {
            annotator.plainHighlightEnabled = true;
            annotator.highlightMousedownHandler({ clientX: 1, clientY: 1 });
            expect(controller.applyActionToThreads).toBeCalled();
        });
    });

    describe('highlightMouseupHandler()', () => {
        beforeEach(() => {
            annotator.highlightCreateHandler = jest.fn();
            annotator.mouseDownEvent = { clientX: 100, clientY: 100 };
        });

        it('should call highlightCreateHandler if on desktop and the mouse moved', () => {
            annotator.highlightMouseupHandler({ x: 0, y: 0 });
            expect(annotator.highlightCreateHandler).toBeCalled();
        });

        it('should call highlightCreateHandler if on desktop and the user double clicked', () => {
            annotator.highlightMouseupHandler({ type: 'dblclick' });
            expect(annotator.highlightCreateHandler).toBeCalled();
        });

        it('should call highlighter.removeAllHighlghts', () => {
            annotator.highlighter = {
                removeAllHighlights: jest.fn()
            };
            annotator.highlightMouseupHandler({ x: 0, y: 0 });
            expect(annotator.highlighter.removeAllHighlights).toBeCalled();
        });
    });

    describe('onSelectionChange()', () => {
        let event;

        beforeEach(() => {
            event = {
                nodeName: 'textarea',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            docUtil.isValidSelection = jest.fn().mockReturnValue(true);
            annotator.lastSelection = {};

            annotator.highlighter = { removeAllHighlights: jest.fn() };

            window.getSelection = jest.fn();
            util.getPageInfo = jest.fn().mockReturnValue({ page: 1 });
        });

        it('should reset the selectionEndTimeout', () => {
            annotator.selectionEndTimeout = 1;
            docUtil.isValidSelection = jest.fn().mockReturnValue(false);
            annotator.onSelectionChange(event);
            expect(annotator.selectionEndTimeout).toBeNull();
        });

        it('should do nothing if focus is on a text input element', () => {
            const textAreaEl = document.createElement('textarea');
            annotator.annotatedElement.appendChild(textAreaEl);
            textAreaEl.focus();

            annotator.onSelectionChange(event);
            expect(window.getSelection).not.toBeCalled();
        });

        it('should do nothing the the user is currently creating a point annotation', () => {
            annotator.modeControllers = {
                point: controller
            };
            controller.pendingThreadID = 'something';
            annotator.onSelectionChange(event);
            expect(window.getSelection).not.toBeCalled();
        });

        it('should clear selection if the highlight has not changed', () => {
            const selection = {
                anchorNode: 'derp',
                toString: () => '' // Causes invalid selection
            };
            docUtil.hasSelectionChanged = jest.fn().mockReturnValue(false);
            window.getSelection = jest.fn().mockReturnValue(selection);

            annotator.onSelectionChange(event);
            expect(annotator.highlighter.removeAllHighlights).toBeCalled();
        });

        it('should clear out highlights and exit "annotation creation" mode if an invalid selection', () => {
            const selection = {
                toString: () => '' // Causes invalid selection
            };
            window.getSelection = jest.fn().mockReturnValue(selection);
            annotator.lastHighlightEvent = event;
            docUtil.hasSelectionChanged = jest.fn().mockReturnValue(true);
            docUtil.isValidSelection = jest.fn().mockReturnValue(false);

            annotator.onSelectionChange(event);
            expect(annotator.lastHighlightEvent).toBeNull();
            expect(annotator.highlighter.removeAllHighlights).toBeCalled();
        });

        it('should show the createHighlightDialog', () => {
            const selection = {
                rangeCount: 10,
                isCollapsed: false,
                toString: () => 'asdf'
            };
            window.getSelection = jest.fn().mockReturnValue(selection);
            docUtil.hasSelectionChanged = jest.fn().mockReturnValue(true);
            annotator.lastHighlightEvent = event;
            annotator.createHighlightDialog.isVisible = false;

            annotator.onSelectionChange(event);
            expect(annotator.selectionEndTimeout).not.toBeNull();
        });

        it('should set all of the highlight annotations on the page to "inactive" state', () => {
            const selection = {
                rangeCount: 10,
                isCollapsed: false,
                toString: jest.fn().mockReturnValue('asdf')
            };
            annotator.modeControllers = {
                highlight: controller
            };
            docUtil.hasSelectionChanged = jest.fn().mockReturnValue(true);
            annotator.plainHighlightEnabled = true;
            annotator.commentHighlightEnabled = false;
            window.getSelection = jest.fn().mockReturnValue(selection);

            annotator.onSelectionChange(event);
            expect(controller.applyActionToThreads).toBeCalledWith(expect.any(Function), 1);
        });
    });

    describe('highlightCreateHandler()', () => {
        const selection = {
            rangeCount: 1
        };
        let pageInfo;
        const event = new Event({ x: 1, y: 1 });

        beforeEach(() => {
            pageInfo = { pageEl: {}, page: 1 };
            util.getPageInfo = jest.fn().mockReturnValue(pageInfo);
            annotator.getLocationFromEvent = jest.fn().mockReturnValue(undefined);
            controller.registerThread = jest.fn();
            window.getSelection = jest.fn().mockReturnThis({ rangeCount: 0 });
            event.stopPropagation = jest.fn();
        });

        afterEach(() => {
            thread.state = 'inactive';
        });

        it('should stop event propagation', () => {
            annotator.highlightCreateHandler(event);
            expect(event.stopPropagation).toBeCalled();
        });

        it('should do nothing if there are no selections present', () => {
            selection.rangeCount = 0;
            expect(thread.reset).not.toBeCalled();
        });

        it('should do nothing if the selection is collapsed', () => {
            selection.isCollapsed = true;
            expect(thread.reset).not.toBeCalled();
        });

        it('should show the create highlight dialog', () => {
            const pageRect = { top: 0, left: 0 };

            docUtil.getDialogCoordsFromRange = jest.fn().mockReturnValue({ x: 10, y: 10 });

            pageInfo.pageEl.getBoundingClientRect = jest.fn().mockReturnValue(pageRect);
            selection.getRangeAt = jest.fn().mockReturnValue({});

            annotator.highlightCreateHandler(event);
            expect(annotator.createHighlightDialog.show).toBeCalled();
        });

        it('should position the create highlight dialog, if not on mobile', () => {
            docUtil.getDialogCoordsFromRange = jest.fn().mockReturnValue({ x: 50, y: 35 });
            const pageRect = {
                top: 0,
                left: 0
            };
            pageInfo.pageEl.getBoundingClientRect = jest.fn().mockReturnValue(pageRect);
            selection.getRangeAt = jest.fn().mockReturnValue({});

            annotator.highlightCreateHandler(event);
            expect(annotator.createHighlightDialog.show).toBeCalled();
        });
    });

    describe('highlightClickHandler()', () => {
        let event;

        beforeEach(() => {
            event = { target: {} };
            util.getPageInfo = jest.fn().mockReturnValue({ pageEl: {}, page: 1 });

            annotator.clickThread = jest.fn();
            annotator.hideAnnotations = jest.fn();
            annotator.resetHighlightSelection = jest.fn();
            annotator.modeControllers = {
                highlight: controller
            };
            annotator.activeThread = undefined;
            annotator.plainHighlightEnabled = false;
            annotator.commentHighlightEnabled = false;
        });

        it('should find the active plain highlight', () => {
            annotator.plainHighlightEnabled = true;
            annotator.highlightClickHandler(event);
            expect(controller.getIntersectingThreads).toBeCalled();
            expect(annotator.hideAnnotations).toBeCalled();
            expect(thread.show).not.toBeCalled();
        });

        it('should find the active highlight comment', () => {
            annotator.modeControllers = {
                'highlight-comment': controller
            };
            annotator.commentHighlightEnabled = true;
            annotator.highlightClickHandler(event);
            expect(controller.getIntersectingThreads).toBeCalled();
            expect(annotator.hideAnnotations).toBeCalled();
            expect(thread.show).not.toBeCalled();
        });

        it('should show an active thread on the page', () => {
            annotator.plainHighlightEnabled = true;
            controller.getIntersectingThreads = jest.fn(() => {
                annotator.activeThread = thread;
            });
            annotator.highlightClickHandler(event);
            expect(annotator.hideAnnotations).toBeCalled();
            expect(thread.show).toBeCalled();
        });

        it('should reset the mobile dialog if no active thread exists', () => {
            annotator.plainHighlightEnabled = true;
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(true);
            annotator.getLocationFromEvent = jest.fn().mockReturnValue({});

            annotator.highlightClickHandler(event);
            expect(annotator.hideAnnotations).toBeCalled();
            expect(thread.show).not.toBeCalled();
        });

        it('should reset highlight selection if not on mobile and no active threads exist', () => {
            annotator.plainHighlightEnabled = true;
            document.getSelection = jest.fn().mockReturnValue({
                removeAllRanges: jest.fn()
            });

            annotator.highlightClickHandler(event);
            expect(annotator.resetHighlightSelection).toBeCalled();
        });
    });

    describe('clickThread()', () => {
        beforeEach(() => {
            thread.type = 'something';
            thread.state = STATES.inactive;
            util.isHighlightAnnotation = jest.fn().mockReturnValue(false);

            annotator.consumed = false;
        });

        it('should destroy any pending point annotations', () => {
            thread.type = 'point';
            thread.state = STATES.pending;
            annotator.clickThread({}, thread);
            expect(thread.destroy).toBeCalled();
        });

        it('should cancel any pending threads that are not point annotations', () => {
            thread.state = STATES.pending;
            annotator.clickThread({}, thread);
            expect(thread.cancelFirstComment).toBeCalled();
        });

        it('should set active highlight threads', () => {
            util.isHighlightAnnotation = jest.fn().mockReturnValue(true);

            thread.onClick = jest.fn().mockReturnValue(false);
            annotator.clickThread({}, thread);
            expect(annotator.activeThread).toBeUndefined();
            expect(annotator.consumed).toBeFalsy();

            const thread2 = new DocHighlightThread();
            thread2.onClick = jest.fn().mockReturnValue(true);
            thread2.type = 'something';
            annotator.clickThread({}, thread2);
            expect(annotator.activeThread).toEqual(thread2);
            expect(annotator.consumed).toBeTruthy();
        });

        it('should hide all non-pending mobile dialogs', () => {
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(true);
            annotator.clickThread({}, thread);
            expect(thread.unmountPopover).toBeCalled();
        });
    });

    describe('useDefaultCursor()', () => {
        it('should use the default cursor instead of the text cursor', () => {
            annotator.useDefaultCursor();
            const cursorEl = document.querySelector(SELECTOR_DEFAULT_CURSOR);
            expect(cursorEl).not.toBeNull();
        });
    });

    describe('removeDefaultCursor()', () => {
        it('should use the text cursor instead of the default cursor', () => {
            annotator.removeDefaultCursor();
            const cursorEl = document.querySelector(SELECTOR_DEFAULT_CURSOR);
            expect(cursorEl).toBeNull();
        });
    });

    describe('removeRangyHighlight()', () => {
        it('should do nothing if there is not an array of highlights', () => {
            annotator.highlighter = {
                highlights: [{ id: 1 }, { id: 2 }, { id: 3 }],
                filter: jest.fn(),
                removeHighlights: jest.fn()
            };
            Array.isArray = jest.fn().mockReturnValue(false);

            annotator.removeRangyHighlight({ id: 1 });
            expect(annotator.highlighter.filter).not.toBeCalled();
            expect(annotator.highlighter.removeHighlights).not.toBeCalled();
        });

        it('should call removeHighlights on any matching highlight ids', () => {
            annotator.highlighter = {
                highlights: {
                    filter: jest.fn().mockReturnValue(1),
                    ids: [1, 2, 3, 4]
                },
                filter: jest.fn(),
                removeHighlights: jest.fn()
            };
            Array.isArray = jest.fn().mockReturnValue(true);

            annotator.removeRangyHighlight({ id: 1 });
            expect(annotator.highlighter.removeHighlights).toBeCalled();
        });
    });

    describe('isCreatingAnnotation()', () => {
        it('should return true if a mode is creating an annotation', () => {
            controller.hadPendingThreads = true;
            annotator.modeControllers = {
                draw: controller,
                point: controller
            };
            expect(annotator.isCreatingAnnotation()).toBeTruthy();
        });

        it('should return false if all modes are NOT creating annotations', () => {
            controller.hadPendingThreads = false;
            annotator.modeControllers = {
                draw: controller,
                point: controller
            };
            expect(annotator.isCreatingAnnotation()).toBeFalsy();
        });
    });

    describe('handleControllerEvents()', () => {
        const mode = 'something';

        beforeEach(() => {
            annotator.createHighlightDialog.isVisible = true;
            annotator.toggleAnnotationMode = jest.fn();
            annotator.renderPage = jest.fn();
            annotator.resetHighlightSelection = jest.fn();
            annotator.hideCreateDialog = jest.fn();
            annotator.annotatedElement = document.createElement('div');
        });

        it('should clear selections and hide the createHighlightDialog on togglemode if needed', () => {
            annotator.handleControllerEvents({ event: CONTROLLER_EVENT.toggleMode, mode });
            expect(annotator.resetHighlightSelection).toBeCalled();
        });

        it('should hide the createHighlightDialog on binddomlisteners', () => {
            annotator.handleControllerEvents({ event: CONTROLLER_EVENT.bindDOMListeners });
            expect(annotator.hideCreateDialog).toBeCalled();
        });

        it('should render the specified page on annotationsrenderpage', () => {
            annotator.handleControllerEvents({ event: CONTROLLER_EVENT.renderPage });
            expect(annotator.renderPage).toBeCalled();
        });
    });
});

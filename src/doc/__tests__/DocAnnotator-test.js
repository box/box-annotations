/* eslint-disable no-unused-expressions */
import rangy from 'rangy';
import Annotator from '../../Annotator';
import Annotation from '../../Annotation';
import AnnotationThread from '../../AnnotationThread';
import DocAnnotator from '../DocAnnotator';
import DocHighlightThread from '../DocHighlightThread';
import DocDrawingThread from '../DocDrawingThread';
import DocPointThread from '../DocPointThread';
import * as util from '../../util';
import * as docUtil from '../docUtil';
import {
    ANNOTATOR_EVENT,
    STATES,
    TYPES,
    CLASS_HIDDEN,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT,
    CLASS_ANNOTATION_PLAIN_HIGHLIGHT,
    DATA_TYPE_ANNOTATION_DIALOG,
    CONTROLLER_EVENT,
    CREATE_EVENT,
    SELECTOR_ANNOTATED_ELEMENT
} from '../../constants';

let annotator;
let stubs = {};
const sandbox = sinon.sandbox.create();

const CLASS_DEFAULT_CURSOR = 'bp-use-default-cursor';

describe('doc/DocAnnotator', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('doc/__tests__/DocAnnotator-test.html');

        stubs.controller = { enter: () => {} };
        stubs.controllerMock = sandbox.mock(stubs.controller);

        const options = {
            annotator: {
                NAME: 'name',
                TYPE: ['highlight', 'highlight-comment'],
                CONTROLLERS: { something: stubs.controller }
            }
        };
        annotator = new DocAnnotator({
            canAnnotate: true,
            container: document,
            annotationService: {},
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
        annotator.annotatedElement = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
        annotator.annotationService = {};
        annotator.threads = {};
        annotator.modeControllers = {};
        annotator.permissions = annotator.getAnnotationPermissions(annotator.options.file);
        sandbox.stub(annotator, 'emit');

        stubs.thread = {
            threadID: '123abc',
            location: { page: 1 },
            state: STATES.pending,
            type: TYPES.highlight,
            cancelFirstComment: () => {},
            onClick: () => {},
            show: () => {},
            reset: () => {},
            destroy: () => {},
            onMousemove: () => {},
            hideDialog: () => {}
        };
        stubs.threadMock = sandbox.mock(stubs.thread);

        stubs.getPageInfo = sandbox.stub(util, 'getPageInfo');
        annotator.createHighlightDialog = {
            emit: () => {},
            addListener: () => {},
            removeListener: () => {},
            destroy: () => {},
            show: () => {},
            hide: () => {},
            setPosition: () => {}
        };
        stubs.createDialogMock = sandbox.mock(annotator.createHighlightDialog);
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        annotator.threads = {};
        annotator.modeButtons = {};
        annotator.modeControllers = {};

        annotator.annotatedElement = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
        if (typeof annotator.destroy === 'function') {
            annotator.destroy();
            annotator = null;
        }
        stubs = {};
    });

    describe('init()', () => {
        it('should add ID to annotatedElement add createHighlightDialog init listener', () => {
            annotator.init(1);
            expect(annotator.annotatedElement.id).to.not.be.undefined;
        });
    });

    describe('getAnnotatedEl()', () => {
        it('should return the annotated element as the document', () => {
            expect(annotator.annotatedElement).to.not.be.null;
        });
    });

    describe('getLocationFromEvent()', () => {
        const x = 100;
        const y = 200;
        const dimensions = { x, y };
        const quadPoints = [[1, 2, 3, 4, 5, 6, 7, 8], [2, 3, 4, 5, 6, 7, 8, 9]];
        const page = 3;

        beforeEach(() => {
            stubs.event = {
                clientX: x,
                clientY: y,
                target: annotator.annotatedEl
            };
            annotator.isMobile = false;

            stubs.selection = sandbox.stub(docUtil, 'isSelectionPresent').returns(true);
            stubs.pageEl = {
                getBoundingClientRect: sandbox.stub().returns({
                    width: dimensions.x,
                    height: dimensions.y + 30, // 15px padding top and bottom,
                    top: 0,
                    left: 0
                })
            };
            stubs.getPageInfo.returns({ pageEl: stubs.pageEl, page });

            stubs.getHighlights = sandbox.stub(docUtil, 'getHighlightAndHighlightEls').returns({
                highlight: {},
                highlightEls: []
            });

            stubs.findClosest = sandbox.stub(util, 'findClosestDataType').returns(DATA_TYPE_ANNOTATION_DIALOG);
            stubs.isInDialog = sandbox.stub(util, 'isInDialog').returns(false);
            stubs.scale = sandbox.stub(util, 'getScale').returns(1);

            // stub highlight methods
            stubs.points = sandbox.stub(docUtil, 'getQuadPoints');
            stubs.getSel = sandbox.stub(window, 'getSelection').returns({});
            stubs.saveSel = sandbox.stub(rangy, 'saveSelection');
            stubs.removeRangy = sandbox.stub(annotator, 'removeRangyHighlight');
            stubs.restoreSel = sandbox.stub(rangy, 'restoreSelection');
        });

        it('should replace event with mobile touch event if user is on a touch enabled device', () => {
            annotator.hasTouch = true;
            stubs.event = {
                targetTouches: [
                    {
                        clientX: x,
                        clientY: y,
                        target: annotator.annotatedEl
                    }
                ]
            };
            annotator.getLocationFromEvent(stubs.event, TYPES.point);
        });

        it('should not return a location if there are no touch event and the user is on a touch enabled device', () => {
            annotator.hasTouch = true;
            expect(annotator.getLocationFromEvent(stubs.event, TYPES.point)).to.be.null;

            stubs.event = {
                targetTouches: [
                    {
                        target: annotator.annotatedEl
                    }
                ]
            };
            annotator;
            expect(annotator.getLocationFromEvent(stubs.event, TYPES.point)).to.be.null;
        });

        it('should not return a location if click isn\'t on page', () => {
            stubs.selection.returns(false);
            stubs.getPageInfo.returns({ pageEl: null, page: -1 });
            expect(annotator.getLocationFromEvent(stubs.event, TYPES.point)).to.be.null;
        });

        describe(TYPES.point, () => {
            it('should not return a location if there is a selection present', () => {
                expect(annotator.getLocationFromEvent(stubs.event, TYPES.point)).to.be.null;
            });

            it('should not return a location if click is on dialog', () => {
                stubs.selection.returns(false);
                stubs.getPageInfo.returns({
                    pageEl: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                    page: 1
                });
                stubs.isInDialog.returns(true);
                expect(annotator.getLocationFromEvent(stubs.event, TYPES.point)).to.be.null;
            });

            it('should not return a location if click event does not have coordinates', () => {
                stubs.selection.returns(false);
                stubs.findClosest.returns('not-a-dialog');
                sandbox.stub(docUtil, 'convertDOMSpaceToPDFSpace');

                expect(annotator.getLocationFromEvent({}, TYPES.point)).to.be.null;
                expect(docUtil.convertDOMSpaceToPDFSpace).to.not.be.called;
            });

            it('should return a valid point location if click is valid', () => {
                stubs.selection.returns(false);
                stubs.findClosest.returns('not-a-dialog');
                sandbox.stub(docUtil, 'convertDOMSpaceToPDFSpace').returns([x, y]);

                const location = annotator.getLocationFromEvent(stubs.event, TYPES.point);
                expect(location).to.deep.equal({ x, y, page, dimensions });
            });
        });

        describe(TYPES.highlight, () => {
            beforeEach(() => {
                annotator.setupAnnotations();
                annotator.highlighter = {
                    highlights: []
                };
            });

            it('should not return a location if there is no selection present', () => {
                expect(annotator.getLocationFromEvent(stubs.event, TYPES.highlight)).to.be.null;
            });

            it('should infer page from selection if it cannot be inferred from event', () => {
                annotator.highlighter.highlights = [{}, {}];
                stubs.getPageInfo.returns({ pageEl: null, page: -1 });

                annotator.getLocationFromEvent(stubs.event, TYPES.highlight);
                expect(stubs.getPageInfo).to.be.called;
            });

            it('should not return a valid highlight location if no highlights exist', () => {
                expect(annotator.getLocationFromEvent(stubs.event, TYPES.highlight)).to.deep.equal(null);
            });

            it('should return a valid highlight location if selection is valid', () => {
                annotator.highlighter.highlights = [{}];
                stubs.points.onFirstCall().returns(quadPoints[0]);
                stubs.points.onSecondCall().returns(quadPoints[1]);

                stubs.getHighlights.returns({ highlight: {}, highlightEls: [{}, {}] });

                const location = annotator.getLocationFromEvent(stubs.event, TYPES.highlight);
                expect(location).to.deep.equal({ page, quadPoints, dimensions });
            });
        });

        describe(TYPES.highlight_comment, () => {
            beforeEach(() => {
                annotator.setupAnnotations();
                annotator.highlighter = {
                    highlights: []
                };
            });

            it('should not return a location if there is no selection present', () => {
                expect(annotator.getLocationFromEvent(stubs.event, TYPES.highlight_comment)).to.be.null;
            });

            it('should infer page from selection if it cannot be inferred from event', () => {
                annotator.highlighter.highlights = [{}, {}];
                stubs.getPageInfo.returns({ pageEl: null, page: -1 });

                annotator.getLocationFromEvent(stubs.event, TYPES.highlight_comment);
                expect(stubs.getPageInfo).to.be.called;
            });

            it('should not return a valid highlight location if no highlights exist', () => {
                annotator.highlighter.highlights = [{}];
                expect(annotator.getLocationFromEvent(stubs.event, TYPES.highlight_comment)).to.deep.equal(null);
            });

            it('should return a valid highlight location if selection is valid', () => {
                annotator.highlighter.highlights = [{}];
                stubs.points.onFirstCall().returns(quadPoints[0]);
                stubs.points.onSecondCall().returns(quadPoints[1]);
                stubs.getHighlights.returns({ highlight: {}, highlightEls: [{}, {}] });

                const location = annotator.getLocationFromEvent(stubs.event, TYPES.highlight_comment);
                expect(location).to.deep.equal({ page, quadPoints, dimensions });
            });
        });
    });

    describe('createAnnotationThread()', () => {
        beforeEach(() => {
            stubs.setupFunc = AnnotationThread.prototype.setup;
            stubs.validateThread = sandbox.stub(util, 'areThreadParamsValid').returns(true);
            sandbox.stub(annotator, 'handleValidationError');
            annotator.notification = {
                show: sandbox.stub()
            };
        });

        afterEach(() => {
            Object.defineProperty(AnnotationThread.prototype, 'setup', { value: stubs.setupFunc });
        });

        it('should create highlight thread and return it', () => {
            const thread = annotator.createAnnotationThread([], {}, TYPES.highlight);
            expect(thread instanceof DocHighlightThread).to.be.true;
            expect(annotator.handleValidationError).to.not.be.called;
        });

        it('should create highlight comment thread and return it', () => {
            const thread = annotator.createAnnotationThread([], {}, TYPES.highlight_comment);
            expect(thread instanceof DocHighlightThread).to.be.true;
            expect(annotator.handleValidationError).to.not.be.called;
        });

        it('should create point thread and return it', () => {
            const thread = annotator.createAnnotationThread([], {}, TYPES.point);
            expect(thread instanceof DocPointThread).to.be.true;
            expect(annotator.handleValidationError).to.not.be.called;
        });

        it('should create highlight thread with appropriate parameters', () => {
            Object.defineProperty(AnnotationThread.prototype, 'setup', { value: sandbox.mock() });
            const annotation = new Annotation({
                fileVersionId: 2,
                threadID: '1',
                type: TYPES.point,
                threadNumber: '1',
                text: 'blah',
                location: { x: 0, y: 0 }
            });
            const thread = annotator.createAnnotationThread([annotation], {}, TYPES.highlight);

            expect(thread.threadID).to.equal(annotation.threadID);
            expect(thread.threadNumber).to.equal(annotation.threadNumber);
            expect(thread instanceof DocHighlightThread).to.be.true;
            expect(annotator.handleValidationError).to.not.be.called;
        });

        it('should create drawing thread and return it', () => {
            const thread = annotator.createAnnotationThread([], {}, TYPES.draw);
            expect(thread instanceof DocDrawingThread).to.be.true;
            expect(annotator.handleValidationError).to.not.be.called;
        });

        it('should emit error and return undefined if thread params are invalid', () => {
            stubs.validateThread.returns(false);
            const thread = annotator.createAnnotationThread([], {}, TYPES.highlight);
            expect(thread instanceof DocHighlightThread).to.be.false;
            expect(thread).to.be.undefined;
            expect(annotator.handleValidationError).to.be.called;
        });

        it('should emit error and return undefined if thread fails to create', () => {
            const thread = annotator.createAnnotationThread([], {}, 'random');
            expect(thread).to.be.undefined;
            expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.error, annotator.localized.loadError);
        });
    });

    describe('createPlainHighlight()', () => {
        beforeEach(() => {
            sandbox.stub(annotator, 'highlightCurrentSelection');
            sandbox.stub(annotator, 'createHighlightThread');
            annotator.createPlainHighlight();
        });

        it('should invoke highlightCurrentSelection()', () => {
            expect(annotator.highlightCurrentSelection).to.be.called;
        });

        it('should invoke createHighlightThread', () => {
            expect(annotator.createHighlightThread).to.be.called;
        });
    });

    describe('createHighlightThread()', () => {
        let thread;
        let dialog;
        beforeEach(() => {
            stubs.getLocationFromEvent = sandbox.stub(annotator, 'getLocationFromEvent');
            stubs.createAnnotationThread = sandbox.stub(annotator, 'createAnnotationThread');
            stubs.renderPage = sandbox.stub(annotator, 'renderPage');

            annotator.highlighter = {
                removeAllHighlights: sandbox.stub()
            };

            dialog = {
                hasComments: false,
                drawAnnotation: sandbox.stub(),
                postAnnotation: sandbox.stub()
            };

            thread = {
                dialog,
                type: 'highlight',
                show: sandbox.stub(),
                getThreadEventData: sandbox.stub()
            };
        });

        it('should do nothing and return null if empty string passed in', () => {
            annotator.lastHighlightEvent = {};
            stubs.createDialogMock.expects('hide').never();
            annotator.createHighlightThread('');
        });

        it('should hide the dialog if it exists and is visible', () => {
            annotator.lastHighlightEvent = {};
            annotator.createHighlightDialog.isVisible = true;
            stubs.createDialogMock.expects('hide').once();
            annotator.createHighlightThread('some text');
        });

        it('should do nothing and return null if there was no highlight event on the previous action', () => {
            annotator.lastHighlightEvent = null;
            stubs.createDialogMock.expects('hide').never();
            annotator.createHighlightThread('some text');
        });

        it('should do nothing and return null if not a valid annotation location', () => {
            annotator.lastHighlightEvent = {};
            stubs.getLocationFromEvent.returns(null);

            annotator.createHighlightThread('some text');
            expect(stubs.createAnnotationThread).to.not.be.called;
        });

        it('should create an annotation thread off of the highlight selection by invoking createAnnotationThread with correct type', () => {
            annotator.lastHighlightEvent = {};
            const location = { page: 1 };
            stubs.getLocationFromEvent.returns(location);
            stubs.createAnnotationThread.returns(thread);

            annotator.createHighlightThread('some text with severe passive agression');
            expect(stubs.createAnnotationThread).to.be.calledWith({}, location, TYPES.highlight_comment);
        });

        it('should bail out of making an annotation if thread is null', () => {
            annotator.lastHighlightEvent = {};
            const location = { page: 1 };
            stubs.getLocationFromEvent.returns(location);
            stubs.createAnnotationThread.returns(null);

            annotator.createHighlightThread('some text');
        });

        it('should render the annotation thread dialog if it is a basic annotation type', () => {
            annotator.lastHighlightEvent = {};
            const location = { page: 1 };
            stubs.getLocationFromEvent.returns(location);
            stubs.createAnnotationThread.returns(thread);

            annotator.createHighlightThread();
            expect(dialog.drawAnnotation).to.be.called;
        });

        it('should set the dialog to have comments if it is a comment-highlight', () => {
            annotator.lastHighlightEvent = {};
            const location = { page: 1 };
            stubs.getLocationFromEvent.returns(location);
            stubs.createAnnotationThread.returns(thread);

            annotator.createHighlightThread('I think this document should be more better');
            expect(dialog.hasComments).to.be.true;
        });

        it('should show the annotation', () => {
            annotator.lastHighlightEvent = {};
            const location = { page: 1 };
            stubs.getLocationFromEvent.returns(location);
            stubs.createAnnotationThread.returns(thread);

            annotator.createHighlightThread();
            expect(thread.show).to.be.called;
        });

        it('should post the annotation via the dialog', () => {
            annotator.lastHighlightEvent = {};
            const location = { page: 1 };
            stubs.getLocationFromEvent.returns(location);
            stubs.createAnnotationThread.returns(thread);
            const text = 'This is an annotation pointing out a mistake in the document!';

            annotator.createHighlightThread(text);
            expect(dialog.postAnnotation).to.be.calledWith(text);
        });

        it('should not register the thread if there is no appropriate controller', () => {
            annotator.lastHighlightEvent = {};
            const location = { page: 1 };
            stubs.getLocationFromEvent.returns(location);
            stubs.createAnnotationThread.returns(thread);

            const controller = { registerThread: sandbox.stub() };
            stubs.registerThread = controller.registerThread;
            annotator.modeControllers = { random: controller };

            expect(annotator.createHighlightThread()).to.deep.equal(thread);
            expect(stubs.registerThread).to.not.be.called;
        });

        it('should return an annotation thread', () => {
            annotator.lastHighlightEvent = {};
            const page = 999999999;
            const location = { page };
            stubs.getLocationFromEvent.returns(location);
            stubs.createAnnotationThread.returns(thread);

            const controller = { registerThread: sandbox.stub() };
            stubs.registerThread = controller.registerThread;
            annotator.modeControllers = { highlight: controller };

            expect(annotator.createHighlightThread()).to.deep.equal(thread);
            expect(stubs.registerThread).to.be.called;
        });
    });

    describe('renderPage()', () => {
        beforeEach(() => {
            sandbox.stub(annotator, 'scaleAnnotationCanvases');
            annotator.modeControllers = {
                type: {
                    renderPage: sandbox.stub()
                },
                type2: {
                    renderPage: sandbox.stub()
                }
            };
        });

        it('should clear and hide createHighlightDialog on page render', () => {
            annotator.createHighlightDialog = {
                isVisible: true,
                hide: () => {},
                destroy: () => {}
            };
            const createMock = sandbox.mock(annotator.createHighlightDialog);
            createMock.expects('hide');
            annotator.renderPage(1);
            expect(annotator.scaleAnnotationCanvases).to.be.calledWith(1);
            expect(annotator.modeControllers.type.renderPage).to.be.calledWith(1);
            expect(annotator.modeControllers.type2.renderPage).to.be.calledWith(1);
        });
    });

    describe('scaleAnnotationCanvases()', () => {
        beforeEach(() => {
            stubs.scaleCanvas = sandbox.stub(docUtil, 'scaleCanvas');

            // Add pageEl
            stubs.pageEl = document.createElement('div');
            stubs.pageEl.setAttribute('data-page-number', 1);
            annotator.annotatedElement.appendChild(stubs.pageEl);
        });

        it('should do nothing if annotation layer is not present', () => {
            annotator.scaleAnnotationCanvases(1);
            expect(stubs.scaleCanvas).to.not.be.called;
        });

        it('should scale canvas if annotation layer is present', () => {
            const annotationLayerEl = document.createElement('canvas');
            annotationLayerEl.classList.add(CLASS_ANNOTATION_LAYER_HIGHLIGHT);
            stubs.pageEl.appendChild(annotationLayerEl);

            annotator.scaleAnnotationCanvases(1);
            expect(stubs.scaleCanvas).to.be.calledOnce;
        });
    });

    describe('setupAnnotations()', () => {
        const setupFunc = Annotator.prototype.setupAnnotations;

        beforeEach(() => {
            Object.defineProperty(Annotator.prototype, 'setupAnnotations', { value: sandbox.stub() });
            stubs.highlighter = { addClassApplier: sandbox.stub() };
            sandbox.stub(rangy, 'createHighlighter').returns(stubs.highlighter);

            annotator.modeControllers = {
                highlight: {},
                'highlight-comment': {}
            };
        });

        afterEach(() => {
            Object.defineProperty(Annotator.prototype, 'setupAnnotations', { value: setupFunc });
        });

        it('should not bind any plain highlight functions if they are disabled', () => {
            stubs.createDialogMock
                .expects('addListener')
                .withArgs(CREATE_EVENT.plain, sinon.match.func)
                .never();
        });

        it('should not bind any comment highlight functions if they are disabled', () => {
            stubs.createDialogMock
                .expects('addListener')
                .withArgs(CREATE_EVENT.comment, sinon.match.func)
                .never();
            stubs.createDialogMock
                .expects('addListener')
                .withArgs(CREATE_EVENT.post, sinon.match.func)
                .never();
        });

        it('should call parent to setup annotations and initialize highlighter', () => {
            annotator.setupAnnotations();
            expect(rangy.createHighlighter).to.be.called;
            expect(stubs.highlighter.addClassApplier).to.be.called;
        });
    });

    describe('bindDOMListeners()', () => {
        const bindFunc = Annotator.prototype.bindDOMListeners;

        beforeEach(() => {
            Object.defineProperty(Annotator.prototype, 'bindDOMListeners', { value: sandbox.stub() });
            annotator.annotatedElement = {
                addEventListener: () => {},
                removeEventListener: () => {}
            };
            stubs.elMock = sandbox.mock(annotator.annotatedElement);

            annotator.permissions.canAnnotate = true;
            annotator.plainHighlightEnabled = true;
            annotator.drawEnabled = true;
        });

        afterEach(() => {
            Object.defineProperty(Annotator.prototype, 'bindDOMListeners', { value: bindFunc });
        });

        it('should bind DOM listeners if user can annotate and highlight', () => {
            stubs.elMock.expects('addEventListener').withArgs('mouseup', annotator.highlightMouseupHandler);
            stubs.elMock.expects('addEventListener').withArgs('wheel', annotator.hideCreateDialog);
            stubs.elMock.expects('addEventListener').withArgs('dblclick', annotator.highlightMouseupHandler);
            stubs.elMock.expects('addEventListener').withArgs('mousedown', annotator.highlightMousedownHandler);
            stubs.elMock.expects('addEventListener').withArgs('contextmenu', annotator.highlightMousedownHandler);
            stubs.elMock.expects('addEventListener').withArgs('click', annotator.drawingSelectionHandler);
            annotator.bindDOMListeners();
        });

        it('should bind draw selection handlers regardless of if the user can annotate ', () => {
            annotator.permissions.canAnnotate = false;
            const annotatedElementListen = sandbox.spy(annotator.annotatedElement, 'addEventListener');

            // Desktop draw selection handlers
            annotator.bindDOMListeners();
            expect(annotatedElementListen).to.be.calledWith('click', annotator.drawingSelectionHandler);

            // Mobile draw selection handlers
            annotator.isMobile = true;
            annotator.hasTouch = true;
            annotator.bindDOMListeners();
            expect(annotatedElementListen).to.be.calledWith('touchstart', annotator.drawingSelectionHandler);
        });

        it('should bind highlight mouse move handlers regardless of if the user can annotate only on desktop', () => {
            annotator.permissions.canAnnotate = false;
            annotator.plainHighlightEnabled = true;
            annotator.commentHighlightEnabled = true;
            annotator.drawEnabled = false;

            stubs.elMock.expects('addEventListener').withArgs('mouseup', annotator.highlightMouseupHandler);
            stubs.elMock.expects('addEventListener').withArgs('wheel', annotator.hideCreateDialog);
            annotator.bindDOMListeners();
        });

        it('should bind selectionchange event on the document, if on mobile OR a touch-enabled device and can annotate', () => {
            annotator.isMobile = true;
            annotator.hasTouch = false;
            annotator.drawEnabled = true;

            const docListen = sandbox.spy(document, 'addEventListener');

            annotator.bindDOMListeners();
            expect(docListen).to.be.calledWith('selectionchange', annotator.onSelectionChange);

            annotator.isMobile = false;
            annotator.hasTouch = true;
            annotator.bindDOMListeners();
            expect(docListen).to.be.calledWith('selectionchange', annotator.onSelectionChange);
        });

        it('should not bind selection change event if both annotation types are disabled, and touch OR mobile enabled', () => {
            annotator.isMobile = true;
            annotator.plainHighlightEnabled = false;
            annotator.commentHighlightEnabled = false;
            annotator.drawEnabled = true;

            const docListen = sandbox.spy(document, 'addEventListener');

            annotator.bindDOMListeners();
            expect(docListen).to.not.be.calledWith('selectionchange', sinon.match.func);
        });

        it('should not bind selection change event if both annotation types are disabled, and touch OR mobile disabled', () => {
            annotator.isMobile = false;
            annotator.hasTouch = false;
            annotator.plainHighlightEnabled = false;
            annotator.commentHighlightEnabled = false;
            annotator.drawEnabled = true;

            stubs.elMock
                .expects('addEventListener')
                .withArgs('mouseup', annotator.highlightMouseupHandler)
                .never();
            stubs.elMock
                .expects('addEventListener')
                .withArgs('wheel', annotator.hideCreateDialog)
                .never();
            stubs.elMock
                .expects('addEventListener')
                .withArgs('dblclick', annotator.highlightMouseupHandler)
                .never();
            stubs.elMock
                .expects('addEventListener')
                .withArgs('mousedown', annotator.highlightMousedownHandler)
                .never();
            stubs.elMock
                .expects('addEventListener')
                .withArgs('contextmenu', annotator.highlightMousedownHandler)
                .never();

            stubs.elMock.expects('addEventListener').withArgs('click', annotator.drawingSelectionHandler);

            annotator.bindDOMListeners();
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            annotator.annotatedElement = {
                removeEventListener: () => {}
            };
            stubs.elMock = sandbox.mock(annotator.annotatedElement);
            annotator.highlightMousemoveHandler = () => {};
            annotator.isMobile = false;
            annotator.hasTouch = false;
        });

        it('should unbind DOM listeners if user can annotate', () => {
            annotator.permissions.canAnnotate = true;

            stubs.elMock.expects('removeEventListener').withArgs('mouseup', annotator.highlightMouseupHandler);
            stubs.elMock.expects('removeEventListener').withArgs('wheel', annotator.hideCreateDialog);
            stubs.elMock.expects('removeEventListener').withArgs('touchend', annotator.hideCreateDialog);
            stubs.elMock.expects('removeEventListener').withArgs('dblclick', annotator.highlightMouseupHandler);
            stubs.elMock.expects('removeEventListener').withArgs('mousedown', annotator.highlightMousedownHandler);
            stubs.elMock.expects('removeEventListener').withArgs('contextmenu', annotator.highlightMousedownHandler);
            stubs.elMock.expects('removeEventListener').withArgs('click', annotator.drawingSelectionHandler);
            annotator.unbindDOMListeners();
        });

        it('should stop and destroy the requestAnimationFrame handle created by getHighlightMousemoveHandler()', () => {
            const rafHandle = 12; // RAF handles are integers
            annotator.permissions.canAnnotate = true;
            annotator.highlightThrottleHandle = rafHandle;

            const cancelRAFStub = sandbox.stub(window, 'cancelAnimationFrame');
            annotator.unbindDOMListeners();

            expect(cancelRAFStub).to.be.calledWith(rafHandle);
            expect(annotator.highlightThrottleHandle).to.not.exist;
        });

        it('should unbind selectionchange event, on the document, if on a mobile OR touch-enabled device and can annotate', () => {
            annotator.permissions.canAnnotate = true;
            annotator.isMobile = true;
            annotator.hasTouch = false;
            const docStopListen = sandbox.spy(document, 'removeEventListener');

            annotator.unbindDOMListeners();
            expect(docStopListen).to.be.calledWith('selectionchange', sinon.match.func);

            annotator.isMobile = false;
            annotator.hasTouch = true;
            annotator.unbindDOMListeners();
            expect(docStopListen).to.be.calledWith('selectionchange', sinon.match.func);
        });

        it('should tell controllers to clean up selections', () => {
            annotator.permissions.canAnnotate = true;
            annotator.modeControllers = {
                test: {
                    removeSelection: sandbox.stub()
                }
            };

            annotator.unbindDOMListeners();
            expect(annotator.modeControllers.test.removeSelection).to.be.called;
        });
    });

    describe('removeThreadFromSharedDialog()', () => {
        beforeEach(() => {
            sandbox.stub(util, 'hideElement');
            sandbox.stub(util, 'showElement');
        });

        it('should do nothing if the mobile dialog does not exist', () => {
            annotator.removeThreadFromSharedDialog();
            expect(util.hideElement).to.not.be.called;
        });

        it('should remove the plain highlight dialog class on reset', () => {
            annotator.mobileDialogEl = {
                classList: {
                    contains: sandbox.stub().returns(true),
                    remove: sandbox.stub()
                },
                removeChild: sandbox.stub(),
                lastChild: {}
            };
            annotator.removeThreadFromSharedDialog();
            expect(util.hideElement).to.not.be.called;
            expect(annotator.mobileDialogEl.classList.remove).to.be.calledWith(CLASS_ANNOTATION_PLAIN_HIGHLIGHT);
        });
    });

    describe('resetHighlightSelection()', () => {
        beforeEach(() => {
            sandbox.stub(annotator, 'hideCreateDialog');
        });

        it('should hide the visible createHighlightDialog and clear the text selection', () => {
            const selection = {
                removeAllRanges: sandbox.stub()
            };
            sandbox.stub(document, 'getSelection').returns(selection);

            annotator.resetHighlightSelection({});
            expect(annotator.hideCreateDialog).to.be.called;
            expect(annotator.isCreatingHighlight).to.be.false;
            expect(selection.removeAllRanges).to.be.called;
        });
    });

    describe('highlightCurrentSelection()', () => {
        beforeEach(() => {
            annotator.highlighter = {
                highlightSelection: sandbox.stub()
            };
            annotator.setupAnnotations();
        });

        it('should invoke highlighter.highlightSelection()', () => {
            annotator.highlightCurrentSelection();
            expect(annotator.highlighter.highlightSelection).to.be.called;
        });

        it('should invoke highlighter.highlightSelection() with the annotated element\'s id', () => {
            annotator.highlightCurrentSelection();
            expect(annotator.highlighter.highlightSelection).to.be.calledWith('rangy-highlight', {
                containerElementId: 'doc-annotator-el'
            });
        });
    });

    describe('highlightMousedownHandler()', () => {
        beforeEach(() => {
            const thread = {
                type: 'highlight',
                location: { page: 1 },
                onMousedown: () => {}
            };
            stubs.threadMock = sandbox.mock(thread);
            annotator.modeControllers = {
                highlight: {
                    threads: { 1: { '123abc': thread } },
                    applyActionToThreads: () => {}
                }
            };

            stubs.controllerMock = sandbox.mock(annotator.modeControllers.highlight);
        });

        it('should do nothing if highlights are disabled', () => {
            stubs.threadMock.expects('onMousedown').never();
            annotator.highlightMousedownHandler({ clientX: 1, clientY: 1 });
        });

        it('should get highlights on page and call their onMouse down method', () => {
            annotator.plainHighlightEnabled = true;
            stubs.controllerMock.expects('applyActionToThreads');
            annotator.highlightMousedownHandler({ clientX: 1, clientY: 1 });
        });
    });

    describe('highlightMouseupHandler()', () => {
        beforeEach(() => {
            stubs.create = sandbox.stub(annotator, 'highlightCreateHandler');
            stubs.click = sandbox.stub(annotator, 'highlightClickHandler');
            annotator.mouseX = undefined;
            annotator.mouseY = undefined;
        });

        it('should call highlightCreateHandler if on desktop and the mouse moved', () => {
            annotator.mouseX = 100;
            annotator.mouseY = 100;
            annotator.highlightMouseupHandler({ x: 0, y: 0 });
            expect(stubs.create).to.be.called;
            expect(stubs.click).to.not.be.called;
        });

        it('should call highlightCreateHandler if on desktop and the user double clicked', () => {
            annotator.highlightMouseupHandler({ type: 'dblclick' });
            expect(stubs.create).to.be.called;
            expect(stubs.click).to.not.be.called;
        });

        it('should call highlightClickHandler if on desktop and createHighlightDialog exists', () => {
            annotator.createHighlightDialog = undefined;

            annotator.highlightMouseupHandler({ x: 0, y: 0 });
            expect(stubs.create).to.not.be.called;
            expect(stubs.click).to.be.called;
        });

        it('should call highlighter.removeAllHighlghts', () => {
            annotator.highlighter = {
                removeAllHighlights: sandbox.stub()
            };
            annotator.highlightMouseupHandler({ x: 0, y: 0 });
            expect(annotator.highlighter.removeAllHighlights).to.be.called;
        });
    });

    describe('onSelectionChange()', () => {
        const event = {
            nodeName: 'textarea',
            preventDefault: () => {},
            stopPropagation: () => {}
        };

        beforeEach(() => {
            stubs.eventMock = sandbox.mock(event);
            stubs.eventMock.expects('preventDefault');
            stubs.eventMock.expects('stopPropagation');

            stubs.isValidSelection = sandbox.stub(docUtil, 'isValidSelection').returns(true);
            annotator.lastSelection = {};

            annotator.setupAnnotations();
            annotator.mobileDialogEl = document.createElement('div');
            annotator.mobileDialogEl.classList.add(CLASS_HIDDEN);

            annotator.highlighter = { removeAllHighlights: sandbox.stub() };
            annotator.modeControllers = {
                point: {},
                highlight: {
                    applyActionToThreads: () => {}
                },
                'highlight-comment': {
                    applyActionToThreads: () => {}
                }
            };
            stubs.highlightMock = sandbox.mock(annotator.modeControllers.highlight);
            stubs.commentMock = sandbox.mock(annotator.modeControllers['highlight-comment']);

            stubs.getSelStub = sandbox.stub(window, 'getSelection');
            stubs.getPageInfo.returns({ page: 1 });
        });

        it('should reset the selectionEndTimeout', () => {
            annotator.selectionEndTimeout = 1;
            stubs.isValidSelection.returns(false);
            annotator.onSelectionChange(event);
            expect(annotator.selectionEndTimeout).is.null;
        });

        it('should do nothing if focus is on a text input element', () => {
            const textAreaEl = document.createElement('textarea');
            annotator.annotatedElement.appendChild(textAreaEl);
            textAreaEl.focus();

            annotator.onSelectionChange(event);
            expect(stubs.getSelStub).to.not.be.called;
        });

        it('should do nothing the the user is currently creating a point annotation', () => {
            annotator.modeControllers.point.pendingThreadID = 'something';
            annotator.onSelectionChange(event);
            expect(stubs.getSelStub).to.not.be.called;
        });

        it('should clear selection if the highlight has not changed', () => {
            const selection = {
                anchorNode: 'derp',
                toString: () => '' // Causes invalid selection
            };
            sandbox.stub(docUtil, 'hasSelectionChanged').returns(false);
            stubs.getSelStub.returns(selection);

            annotator.onSelectionChange(event);
            expect(annotator.highlighter.removeAllHighlights).to.be.called;
        });

        it('should clear out highlights and exit "annotation creation" mode if an invalid selection', () => {
            const selection = {
                toString: () => '' // Causes invalid selection
            };
            stubs.getSelStub.returns(selection);
            annotator.lastHighlightEvent = event;
            sandbox.stub(docUtil, 'hasSelectionChanged').returns(true);
            stubs.isValidSelection.returns(false);

            stubs.createDialogMock.expects('hide');
            annotator.onSelectionChange(event);
            expect(annotator.lastHighlightEvent).to.be.null;
            expect(annotator.highlighter.removeAllHighlights).to.be.called;
        });

        it('should show the createHighlightDialog', () => {
            const selection = {
                rangeCount: 10,
                isCollapsed: false,
                toString: () => 'asdf'
            };
            stubs.getSelStub.returns(selection);
            sandbox.stub(docUtil, 'hasSelectionChanged').returns(true);
            annotator.lastHighlightEvent = event;
            annotator.createHighlightDialog.isVisible = false;

            annotator.onSelectionChange(event);
            expect(annotator.selectionEndTimeout).to.not.be.null;
        });

        it('should set all of the highlight annotations on the page to "inactive" state', () => {
            const selection = {
                rangeCount: 10,
                isCollapsed: false,
                toString: () => 'asdf'
            };
            sandbox.stub(docUtil, 'hasSelectionChanged').returns(true);

            annotator.plainHighlightEnabled = true;
            stubs.highlightMock.expects('applyActionToThreads').withArgs(sinon.match.func, 1);

            annotator.commentHighlightEnabled = false;
            stubs.commentMock
                .expects('applyActionToThreads')
                .withArgs(sinon.match.func, 1)
                .never();

            stubs.getSelStub.returns(selection);
            sandbox.stub(annotator.createHighlightDialog, 'show');

            annotator.onSelectionChange(event);
        });
    });

    describe('highlightCreateHandler()', () => {
        let selection;
        let pageInfo;

        beforeEach(() => {
            selection = {
                rangeCount: 0
            };
            pageInfo = { pageEl: {}, page: 1 };

            stubs.getPageInfo = stubs.getPageInfo.returns(pageInfo);
            stubs.getLocation = sandbox.stub(annotator, 'getLocationFromEvent').returns(undefined);
            stubs.createThread = sandbox.stub(annotator, 'createAnnotationThread');
            stubs.getSel = sandbox.stub(window, 'getSelection');

            stubs.event = new Event({ x: 1, y: 1 });
            stubs.stopEvent = sandbox.stub(stubs.event, 'stopPropagation');
            stubs.getSel.returns(selection);
        });

        afterEach(() => {
            stubs.thread.state = 'inactive';
        });

        it('should stop event propagation', () => {
            annotator.highlightCreateHandler(stubs.event);
            expect(stubs.stopEvent).to.be.called;
        });

        it('should do nothing if there are no selections present', () => {
            selection.rangeCount = 0;
            stubs.threadMock.expects('reset').never();
        });

        it('should do nothing if the selection is collapsed', () => {
            selection.rangeCount = 1;
            selection.isCollapsed = true;
            stubs.threadMock.expects('reset').never();
        });

        it('should show the create highlight dialog', () => {
            const pageRect = {
                top: 0,
                left: 0
            };

            sandbox.stub(docUtil, 'getDialogCoordsFromRange').returns({ x: 10, y: 10 });

            pageInfo.pageEl.getBoundingClientRect = sandbox.stub().returns(pageRect);
            selection.rangeCount = 1;
            selection.getRangeAt = sandbox.stub().returns({});

            stubs.createDialogMock.expects('show').withArgs(pageInfo.pageEl);
            annotator.highlightCreateHandler(stubs.event);
        });

        it('should position the create highlight dialog, if not on mobile', () => {
            sandbox.stub(docUtil, 'getDialogCoordsFromRange').returns({ x: 50, y: 35 });
            const pageRect = {
                top: 0,
                left: 0
            };
            pageInfo.pageEl.getBoundingClientRect = sandbox.stub().returns(pageRect);
            selection.getRangeAt = sandbox.stub().returns({});

            selection.rangeCount = 1;
            annotator.isMobile = false;

            stubs.createDialogMock.expects('show');
            annotator.highlightCreateHandler(stubs.event);
        });
    });

    describe('highlightClickHandler()', () => {
        beforeEach(() => {
            stubs.event = { target: {} };
            stubs.thread = { show: () => {} };
            stubs.threadMock = sandbox.mock(stubs.thread);
            stubs.getPageInfo = stubs.getPageInfo.returns({ pageEl: {}, page: 1 });
            sandbox.stub(annotator, 'clickThread');
            sandbox.stub(annotator, 'removeThreadFromSharedDialog');
            sandbox.stub(annotator, 'hideAnnotations');
            sandbox.stub(annotator, 'resetHighlightSelection');

            annotator.modeControllers = {
                highlight: {
                    getIntersectingThreads: sandbox.stub()
                },
                'highlight-comment': {
                    getIntersectingThreads: sandbox.stub()
                }
            };
            stubs.highlightApply = annotator.modeControllers.highlight.getIntersectingThreads;
            stubs.commentApply = annotator.modeControllers['highlight-comment'].getIntersectingThreads;
        });

        it('should find the active plain highlight', () => {
            annotator.plainHighlightEnabled = true;
            stubs.threadMock.expects('show').never();
            annotator.highlightClickHandler(stubs.event);
            expect(stubs.highlightApply).to.be.called;
            expect(stubs.commentApply).to.not.be.called;
            expect(annotator.hideAnnotations).to.be.called;
        });

        it('should find the active highlight comment', () => {
            annotator.commentHighlightEnabled = true;
            stubs.threadMock.expects('show').never();
            annotator.highlightClickHandler(stubs.event);
            expect(stubs.highlightApply).to.not.be.called;
            expect(stubs.commentApply).to.be.called;
            expect(annotator.hideAnnotations).to.be.called;
        });

        it('should show an active thread on the page', () => {
            annotator.plainHighlightEnabled = true;
            stubs.highlightApply.callsFake(() => {
                annotator.activeThread = stubs.thread;
            });
            stubs.threadMock.expects('show');
            annotator.highlightClickHandler(stubs.event);
            expect(annotator.hideAnnotations).to.be.called;
        });

        it('should reset the mobile dialog if no active thread exists', () => {
            annotator.plainHighlightEnabled = false;
            annotator.commentHighlightEnabled = false;
            stubs.threadMock.expects('show').never();
            annotator.isMobile = true;

            annotator.highlightClickHandler(stubs.event);
            expect(annotator.removeThreadFromSharedDialog).to.be.called;
            expect(annotator.hideAnnotations).to.be.called;
        });

        it('should reset highlight selection if not on mobile and no active threads exist', () => {
            annotator.plainHighlightEnabled = false;
            annotator.commentHighlightEnabled = false;
            stubs.threadMock.expects('show').never();

            annotator.isMobile = false;
            annotator.highlightClickHandler(stubs.event);
            expect(annotator.removeThreadFromSharedDialog).to.not.be.called;
            expect(annotator.resetHighlightSelection).to.be.called;
        });
    });

    describe('clickThread()', () => {
        beforeEach(() => {
            stubs.thread = {
                type: 'something',
                onMousemove: () => {},
                hideDialog: () => {},
                destroy: () => {},
                cancelFirstComment: () => {},
                onClick: () => {}
            };
            stubs.threadMock = sandbox.mock(stubs.thread);
            stubs.pending = sandbox.stub(util, 'isPending').returns(false);

            annotator.consumed = false;
        });

        it('should destroy any pending point annotations', () => {
            stubs.thread.type = 'point';
            stubs.pending.returns(true);
            stubs.threadMock.expects('destroy');
            annotator.clickThread(stubs.thread);
        });

        it('should cancel any pending threads that are not point annotations', () => {
            stubs.pending.returns(true);
            stubs.threadMock.expects('cancelFirstComment');
            annotator.clickThread(stubs.thread);
        });

        it('should set active highlight threads', () => {
            sandbox.stub(util, 'isHighlightAnnotation').returns(true);

            stubs.threadMock.expects('onClick').returns(false);
            annotator.clickThread(stubs.thread);
            expect(annotator.activeThread).to.be.undefined;
            expect(annotator.consumed).to.be.false;

            stubs.thread2 = {
                type: 'something',
                onClick: () => {}
            };
            stubs.thread2Mock = sandbox.mock(stubs.thread2);
            stubs.thread2Mock.expects('onClick').returns(true);

            annotator.clickThread(stubs.thread2);
            expect(annotator.activeThread).to.equal(stubs.thread2);
            expect(annotator.consumed).to.be.true;
        });

        it('should hide all non-pending mobile dialogs', () => {
            annotator.isMobile = true;
            stubs.threadMock.expects('hideDialog');
            annotator.clickThread(stubs.thread);
        });
    });

    describe('useDefaultCursor()', () => {
        it('should use the default cursor instead of the text cursor', () => {
            annotator.useDefaultCursor();
            expect(annotator.annotatedElement).to.have.class(CLASS_DEFAULT_CURSOR);
        });
    });

    describe('removeDefaultCursor()', () => {
        it('should use the text cursor instead of the default cursor', () => {
            annotator.removeDefaultCursor();
            expect(annotator.annotatedElement).to.not.have.class(CLASS_DEFAULT_CURSOR);
        });
    });

    describe('removeRangyHighlight()', () => {
        it('should do nothing if there is not an array of highlights', () => {
            annotator.highlighter = {
                highlights: [{ id: 1 }, { id: 2 }, { id: 3 }],
                filter: () => {},
                removeHighlights: () => {}
            };
            stubs.highlighterMock = sandbox.mock(annotator.highlighter);
            stubs.highlighterMock.expects('filter').never();
            stubs.highlighterMock.expects('removeHighlights').never();
            sandbox.stub(Array, 'isArray').returns(false);

            annotator.removeRangyHighlight({ id: 1 });
        });

        it('should call removeHighlights on any matching highlight ids', () => {
            annotator.highlighter = {
                highlights: {
                    filter: () => {},
                    ids: [1, 2, 3, 4]
                },
                filter: () => {},
                removeHighlights: () => {}
            };
            stubs.highlighterMock = sandbox.mock(annotator.highlighter);
            stubs.highlighterMock.expects('removeHighlights').withArgs(annotator.highlighter.highlights.ids[0]);

            stubs.highlightMock = sandbox.mock(annotator.highlighter.highlights);
            stubs.highlightMock.expects('filter').returns(annotator.highlighter.highlights.ids[0]);

            sandbox.stub(Array, 'isArray').returns(true);

            annotator.removeRangyHighlight({ id: 1 });
        });
    });

    describe('drawingSelectionHandler()', () => {
        beforeEach(() => {
            stubs.drawController = {
                handleSelection: sandbox.stub(),
                removeSelection: sandbox.stub()
            };
            annotator.modeControllers = {
                [TYPES.draw]: stubs.drawController
            };

            stubs.isCreatingAnnotation = sandbox.stub(annotator, 'isCreatingAnnotation').returns(false);
        });

        it('should use the controller to select with the event', () => {
            const evt = 'event';
            annotator.drawingSelectionHandler(evt);
            expect(stubs.drawController.handleSelection).to.be.calledWith(evt);
        });

        it('should do nothing if a mode is creating an annotation', () => {
            stubs.isCreatingAnnotation.returns(true);
            annotator.drawingSelectionHandler('irrelevant');
            expect(stubs.drawController.handleSelection).to.not.be.called;
        });

        it('should do nothing if a highlight is being created', () => {
            annotator.isCreatingHighlight = true;
            annotator.drawingSelectionHandler('irrelevant');
            expect(stubs.drawController.handleSelection).to.not.be.called;
        });

        it('should not error when no modeButtons exist for draw', () => {
            annotator.modeButtons = {};
            expect(() => annotator.drawingSelectionHandler('irrelevant')).to.not.throw();
        });
    });

    describe('isCreatingAnnotation()', () => {
        it('should return true if a mode is creating an annotation', () => {
            annotator.modeControllers = {
                [TYPES.draw]: { hadPendingThreads: false },
                [TYPES.point]: { hadPendingThreads: true }
            };
            expect(annotator.isCreatingAnnotation()).to.be.true;
        });

        it('should return false if all modes are NOT creating annotations', () => {
            annotator.modeControllers = {
                [TYPES.draw]: { hadPendingThreads: false },
                [TYPES.point]: { hadPendingThreads: false }
            };
            expect(annotator.isCreatingAnnotation()).to.be.false;
        });
    });

    describe('handleControllerEvents()', () => {
        const mode = 'something';

        beforeEach(() => {
            sandbox.stub(annotator, 'toggleAnnotationMode');
            annotator.createHighlightDialog = {
                isVisible: true,
                hide: sandbox.stub()
            };
            sandbox.stub(annotator, 'renderPage');
            sandbox.stub(annotator, 'resetHighlightSelection');
            sandbox.stub(annotator, 'hideCreateDialog');
        });

        afterEach(() => {
            annotator.createHighlightDialog = null;
        });

        it('should clear selections and hide the createHighlightDialog on togglemode if needed', () => {
            annotator.handleControllerEvents({ event: CONTROLLER_EVENT.toggleMode, mode });
            expect(annotator.resetHighlightSelection).to.be.called;
        });

        it('should hide the createHighlightDialog on binddomlisteners', () => {
            annotator.handleControllerEvents({ event: CONTROLLER_EVENT.bindDOMListeners });
            expect(annotator.hideCreateDialog).to.be.called;
        });

        it('should render the specified page on annotationsrenderpage', () => {
            annotator.handleControllerEvents({ event: CONTROLLER_EVENT.renderPage });
            expect(annotator.renderPage).to.be.called;
        });
    });
});

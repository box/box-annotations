import APIFactory, { AnnotationsAPI, APICollection } from '../../api';
import DeselectManager from '../../common/DeselectManager';
import eventManager from '../../common/EventManager';
import HtmlDrawingManager from '../HtmlDrawingManager';
import HtmlAnnotator from '../HtmlAnnotator';
import HtmlHighlightManager from '../HtmlHighlightManager';
import PopupManager from '../../popup/PopupManager';
import { Annotation, Event } from '../../@types';
import { annotation as highlight } from '../../highlight/__mocks__/data';
import { annotations as drawings } from '../../drawing/__mocks__/drawingData';
import { HighlightCreatorManager, HighlightListener } from '../../highlight';
import { annotations as regions } from '../../region/__mocks__/data';
import { RegionCreationManager, RegionManager } from '../../region';
import { fetchAnnotationsAction, getIsInitialized, getScale, Mode } from '../../store';
import { getHighlightShapes, scrollWindowToLocation } from '../htmlUtil';
import { Manager } from '../../common/BaseManager';
import { scrollToLocation } from '../../utils/scroll';

jest.mock('@box/blueprint-web', () => ({}));
jest.mock('@box/threaded-annotations', () => ({}));
jest.mock('../../common/DeselectManager');
jest.mock('../../popup/PopupManager');
jest.mock('../HtmlHighlightManager');
jest.mock('../../utils/scroll');
jest.mock('../htmlUtil', () => ({
    ...jest.requireActual('../htmlUtil'),
    getHighlightShapes: jest.fn(),
    scrollWindowToLocation: jest.fn(),
}));

describe('HtmlAnnotator', () => {
    const resizeObserver = { disconnect: jest.fn(), observe: jest.fn() };
    const scrollEl = document.createElement('div');
    const contentEl = document.createElement('div');
    const pageOverlayEl = document.createElement('div');
    const defaults = {
        apiHost: 'https://api.box.com',
        container: pageOverlayEl,
        contentEl,
        file: {
            id: '12345',
            file_version: { id: '98765' },
            permissions: {
                can_create_annotations: true,
                can_view_annotations: true,
            },
        },
        intl: {
            messages: {},
        },
        locale: 'en-US',
        token: '1234567890',
    };
    const mockManager = {
        destroy: jest.fn(),
        exists: jest.fn(),
        render: jest.fn(),
        style: jest.fn(),
    };
    const getAnnotator = (options = {}): HtmlAnnotator => new HtmlAnnotator({ ...defaults, ...options });
    const getPage = (entries: Annotation[] = []): APICollection<Annotation> => ({
        entries,
        limit: 1000,
        next_marker: null,
        previous_marker: null,
    });
    const setOffsets = (el: HTMLElement, offsets: Record<string, number>): void =>
        Object.entries(offsets).forEach(([name, value]) =>
            Object.defineProperty(el, name, { configurable: true, value }),
        );

    let annotator: HtmlAnnotator;
    let getAnnotations: jest.Mock;
    let frameCallbacks: FrameRequestCallback[];
    let resizeCallback: ResizeObserverCallback;

    const flushPromises = (): Promise<void> =>
        new Promise(resolve => {
            setTimeout(resolve);
        });
    const initAnnotator = async (): Promise<void> => {
        annotator.init();
        await flushPromises();
    };

    // The created managers listen on the shared content element and document until destroyed
    const replaceManagers = (managers: Manager[]): void => {
        const created = annotator.managers;
        annotator.managers = new Set(managers);
        created.forEach(manager => manager.destroy());
    };

    const runAnimationFrame = (): void => frameCallbacks.splice(0).forEach(callback => callback(0));
    const triggerResize = (): void => resizeCallback([], resizeObserver as unknown as ResizeObserver);

    beforeAll(() => {
        window.ResizeObserver = jest.fn().mockImplementation((callback: ResizeObserverCallback) => {
            resizeCallback = callback;
            return resizeObserver;
        });
    });

    beforeEach(() => {
        frameCallbacks = [];
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => frameCallbacks.push(callback));
        jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(jest.fn());

        getAnnotations = jest.fn((fileId, fileVersionId, permissions, resolve) => resolve(getPage()));
        jest.spyOn(APIFactory.prototype, 'getAnnotationsAPI').mockImplementation(
            () => ({ destroy: jest.fn(), getAnnotations }) as unknown as AnnotationsAPI,
        );

        contentEl.innerHTML = '<p>Hello world</p>';
        scrollEl.style.overflowY = 'auto';
        scrollEl.appendChild(contentEl);
        document.body.append(scrollEl, pageOverlayEl);
        setOffsets(contentEl, { offsetHeight: 800, offsetLeft: 20, offsetTop: 10, offsetWidth: 600 });
        // jsdom has no layout: the content's rect follows its offsets, and the overlay sits at the page origin
        jest.spyOn(contentEl, 'getBoundingClientRect').mockImplementation(
            () =>
                ({
                    height: contentEl.offsetHeight,
                    left: contentEl.offsetLeft,
                    top: contentEl.offsetTop,
                    width: contentEl.offsetWidth,
                }) as DOMRect,
        );

        annotator = getAnnotator();
    });

    afterEach(() => {
        annotator.destroy();
        scrollEl.remove();
        pageOverlayEl.remove();
    });

    describe('with an overlay in the same document (Markdown)', () => {
        test('should annotate the content element and render layers and popups in the overlay', async () => {
            await initAnnotator();

            const { layersEl, popupPortalEl, referenceEl } = annotator;

            expect(annotator.annotatedEl).toBe(contentEl);
            expect(pageOverlayEl.classList.contains('ba')).toBe(true);
            expect(layersEl?.parentElement).toBe(pageOverlayEl);
            expect(popupPortalEl?.parentElement).toBe(pageOverlayEl);
            expect(referenceEl?.parentElement).toBe(layersEl);
            expect(layersEl?.querySelector('[data-testid="ba-Layer--region"]')).not.toBeNull();
            expect(contentEl.querySelector('.ba-Layer')).toBeNull();
            expect(contentEl.nextElementSibling).toBeNull();
            expect(HtmlHighlightManager).toHaveBeenCalledWith(
                expect.objectContaining({ contentEl, location: 1, referenceEl }),
            );
            expect(DeselectManager).toHaveBeenCalledWith({ referenceEl });
        });

        test('should create the managers once, with input bound to the content element', () => {
            const managers = Array.from(annotator.getManagers(contentEl));

            expect(managers[0]).toBeInstanceOf(PopupManager);
            expect(managers[1]).toBeInstanceOf(HtmlDrawingManager);
            expect(managers[2]).toBeInstanceOf(RegionManager);
            expect(managers[3]).toBeInstanceOf(RegionCreationManager);
            expect((managers[3] as RegionCreationManager).referenceEl).toBe(annotator.referenceEl);
            expect(managers[4]).toBeInstanceOf(HighlightCreatorManager);
            expect((managers[4] as HighlightCreatorManager).referenceEl).toBe(contentEl);
            expect(managers[5]).toBeInstanceOf(HtmlHighlightManager);
            expect(Array.from(annotator.getManagers(contentEl))).toEqual(managers);
        });

        test('should not create the creators or listener when annotation controls are off', async () => {
            annotator.destroy();
            annotator = getAnnotator({ showAnnotationsControls: false });
            await initAnnotator();

            const managers = Array.from(annotator.managers);

            expect(annotator.highlightListener).toBeUndefined();
            expect(managers.some(m => m instanceof HighlightCreatorManager)).toBe(false);
            expect(managers.some(m => m instanceof RegionCreationManager)).toBe(false);
            expect(managers.some(m => m instanceof RegionManager)).toBe(true);
        });

        test('should size the layers to the content rect and render them', async () => {
            jest.spyOn(annotator, 'getManagers').mockImplementation(() => new Set([mockManager]));

            await initAnnotator();

            expect(mockManager.style).toHaveBeenCalledWith({
                height: '800px',
                left: '20px',
                top: '10px',
                width: '600px',
            });
            expect(mockManager.render).toHaveBeenCalledWith({
                callbacks: { onCopyLink: undefined },
                intl: annotator.intl,
                store: annotator.store,
            });
        });

        test('should place the layers at the content rect minus the overlay rect when the scroller scrolls', async () => {
            await initAnnotator();
            replaceManagers([mockManager]);
            jest.spyOn(annotator.layersEl as HTMLElement, 'getBoundingClientRect').mockReturnValue({
                left: 5,
                top: 60,
            } as DOMRect);
            setOffsets(contentEl, { offsetTop: -290 });
            jest.clearAllMocks();

            scrollEl.dispatchEvent(new window.Event('scroll'));
            runAnimationFrame();

            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
            expect(mockManager.style).toHaveBeenCalledWith({
                height: '800px',
                left: '15px',
                top: '-350px',
                width: '600px',
            });
        });

        test('should not schedule another update for the scroll it signals on the layers box', async () => {
            await initAnnotator();
            replaceManagers([mockManager]);
            jest.clearAllMocks();

            scrollEl.dispatchEvent(new window.Event('scroll'));
            runAnimationFrame();
            runAnimationFrame();

            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
            expect(mockManager.style).toHaveBeenCalledTimes(1);
        });

        test('should forward the wheel over the layers to the content scroller', async () => {
            await initAnnotator();
            scrollEl.scrollBy = jest.fn();
            const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaX: 3, deltaY: 40 });

            annotator.referenceEl?.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(true);
            expect(scrollEl.scrollBy).toHaveBeenCalledWith(3, 40);
        });

        test.each(['ctrlKey', 'metaKey'])('should leave a zoom wheel (%s) to the browser', async modifier => {
            await initAnnotator();
            scrollEl.scrollBy = jest.fn();
            const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 40, [modifier]: true });

            annotator.referenceEl?.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(false);
            expect(scrollEl.scrollBy).not.toHaveBeenCalled();
        });

        test('should listen for selection changes and resizes of the content in this document', async () => {
            await initAnnotator();

            expect(annotator.highlightListener).toBeInstanceOf(HighlightListener);
            expect(window.ResizeObserver).toHaveBeenCalledTimes(1);
            expect(resizeObserver.observe).toHaveBeenCalledWith(contentEl);
        });

        test('should mark the content element and add the mode class to it', async () => {
            await initAnnotator();

            expect(contentEl.classList.contains('ba-HtmlAnnotator-content')).toBe(true);

            annotator.emit(Event.ANNOTATIONS_MODE_CHANGE, { mode: Mode.HIGHLIGHT });
            expect(contentEl.classList.contains('ba-is-create--highlight')).toBe(true);

            annotator.emit(Event.ANNOTATIONS_MODE_CHANGE, { mode: Mode.NONE });
            expect(contentEl.classList.contains('ba-is-create--highlight')).toBe(false);

            annotator.destroy();
            expect(contentEl.classList.contains('ba-HtmlAnnotator-content')).toBe(false);
        });
    });

    describe('position updates', () => {
        const highlightManager = Object.assign(Object.create(HtmlHighlightManager.prototype), mockManager, {
            updateShapes: jest.fn(),
        });

        beforeEach(async () => {
            jest.spyOn(annotator, 'getManagers').mockImplementation(() => new Set([mockManager, highlightManager]));
            await initAnnotator();
            annotator.managers = new Set([mockManager, highlightManager]);
            jest.spyOn(annotator, 'render');
            jest.spyOn(annotator, 'postRender');
            jest.spyOn(annotator.store, 'dispatch');
            jest.clearAllMocks();
        });

        test('should coalesce resizes to one update per animation frame', () => {
            triggerResize();
            triggerResize();

            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
        });

        test('should skip a resize that keeps the content size', () => {
            triggerResize();
            runAnimationFrame();

            expect(mockManager.style).not.toHaveBeenCalled();
            expect(highlightManager.updateShapes).not.toHaveBeenCalled();
        });

        test('should update positions and highlight shapes when only the content height changes', () => {
            // An opened <details>, a late image or a rendered diagram makes the content taller at the same width
            setOffsets(contentEl, { offsetHeight: 1200 });

            triggerResize();
            runAnimationFrame();

            expect(mockManager.style).toHaveBeenCalledWith(expect.objectContaining({ height: '1200px' }));
            expect(highlightManager.updateShapes).toHaveBeenCalledTimes(1);
            expect(annotator.render).not.toHaveBeenCalled();
            expect(annotator.store.dispatch).not.toHaveBeenCalled();
        });

        test('should update positions and highlight shapes when the content width changes', () => {
            setOffsets(contentEl, { offsetWidth: 400 });

            triggerResize();
            runAnimationFrame();

            expect(mockManager.style).toHaveBeenCalledWith(expect.objectContaining({ width: '400px' }));
            expect(highlightManager.updateShapes).toHaveBeenCalledTimes(1);
            expect(mockManager.render).not.toHaveBeenCalled();
            expect(annotator.render).not.toHaveBeenCalled();
            expect(annotator.postRender).not.toHaveBeenCalled();
            expect(annotator.store.dispatch).not.toHaveBeenCalled();
        });

        test('should move the layers and find highlight shapes again when a window resize keeps the content size', () => {
            // Fixed-width content centered in its scroller moves on a window resize but keeps its size, and a media
            // query can re-wrap its text without resizing it
            setOffsets(contentEl, { offsetLeft: 120 });

            window.dispatchEvent(new window.Event('resize'));
            runAnimationFrame();

            expect(mockManager.style).toHaveBeenCalledWith(expect.objectContaining({ left: '120px' }));
            expect(highlightManager.updateShapes).toHaveBeenCalledTimes(1);
            expect(annotator.render).not.toHaveBeenCalled();
        });

        test('should find highlight shapes again without clearing the selection when fonts load', () => {
            annotator.handleFontsLoaded();
            runAnimationFrame();

            expect(annotator.render).not.toHaveBeenCalled();
            expect(annotator.store.dispatch).not.toHaveBeenCalled();
            expect(mockManager.style).toHaveBeenCalled();
            expect(highlightManager.updateShapes).toHaveBeenCalledTimes(1);
        });
    });

    describe('initialization', () => {
        let rejectFetch: (error: Error) => void;
        let resolveFetch: (payload: unknown) => void;

        beforeEach(() => {
            getAnnotations.mockImplementation((fileId, fileVersionId, permissions, resolve, reject) => {
                resolveFetch = resolve;
                rejectFetch = reject;
            });
            annotator.destroy();
            annotator = getAnnotator();
            jest.spyOn(eventManager, 'emit');
        });

        test('should initialize when the annotations fetch is fulfilled and emit the fetched annotations', async () => {
            await initAnnotator();

            expect(annotator.annotatedEl).toBeUndefined();
            expect(getIsInitialized(annotator.store.getState())).toBe(false);

            resolveFetch(getPage([highlight]));
            await flushPromises();

            expect(annotator.annotatedEl).toBe(contentEl);
            expect(eventManager.emit).toHaveBeenCalledWith(Event.ANNOTATIONS_INITIALIZED, {
                annotations: [expect.objectContaining({ id: highlight.id })],
            });
        });

        test('should initialize when the annotations fetch is rejected', async () => {
            await initAnnotator();

            expect(annotator.annotatedEl).toBeUndefined();

            rejectFetch(new Error('fetch failed'));
            await flushPromises();

            expect(annotator.annotatedEl).toBe(contentEl);
            expect(eventManager.emit).toHaveBeenCalledWith(Event.ANNOTATIONS_INITIALIZED, { annotations: [] });
        });

        test('should bind the content listeners once when init is called again before the fetch settles', async () => {
            annotator.init(1);
            annotator.init(2);

            resolveFetch(getPage());
            await flushPromises();

            expect(window.ResizeObserver).toHaveBeenCalledTimes(1);
            expect(annotator.highlightListener).toBeInstanceOf(HighlightListener);
            expect(getScale(annotator.store.getState())).toBe(2);
        });

        test('should not initialize when destroyed before the fetch settles', async () => {
            annotator.init();
            annotator.destroy();

            resolveFetch(getPage([highlight]));
            await flushPromises();

            expect(annotator.annotatedEl).toBeUndefined();
            expect(annotator.highlightListener).toBeUndefined();
            expect(window.ResizeObserver).not.toHaveBeenCalled();
            expect(eventManager.emit).not.toHaveBeenCalledWith(Event.ANNOTATIONS_INITIALIZED, expect.anything());
        });

        test('should fetch at construction and initialize at once on content set after the fetch settled', async () => {
            const lateContentEl = document.createElement('div');
            const overlayEl = document.createElement('div');
            document.body.append(lateContentEl, overlayEl);
            annotator.destroy();
            getAnnotations.mockClear();
            annotator = getAnnotator({ container: undefined });

            expect(getAnnotations).toHaveBeenCalledTimes(1);
            resolveFetch(getPage([highlight]));
            await flushPromises();

            annotator.setContent({ container: overlayEl, contentEl: lateContentEl });
            annotator.init();

            expect(annotator.annotatedEl).toBe(lateContentEl);
            expect(annotator.containerEl).toBe(overlayEl);
            expect(eventManager.emit).toHaveBeenCalledWith(Event.ANNOTATIONS_INITIALIZED, {
                annotations: [expect.objectContaining({ id: highlight.id })],
            });
            expect(getAnnotations).toHaveBeenCalledTimes(1);
            lateContentEl.remove();
            overlayEl.remove();
        });
    });

    describe('destroy()', () => {
        test('should stop listening and destroy the managers', async () => {
            await initAnnotator();
            const listener = annotator.highlightListener as HighlightListener;
            jest.spyOn(listener, 'destroy');
            replaceManagers([mockManager]);
            annotator.scheduleUpdate();

            annotator.destroy();

            expect(resizeObserver.disconnect).toHaveBeenCalled();
            expect(listener.destroy).toHaveBeenCalled();
            expect(mockManager.destroy).toHaveBeenCalled();
            expect(window.cancelAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('scrollToAnnotation()', () => {
        beforeEach(async () => {
            await initAnnotator();
            annotator.store.dispatch(
                fetchAnnotationsAction.fulfilled(
                    getPage([highlight, ...drawings, ...regions] as Annotation[]),
                    'test',
                    undefined,
                ),
            );
        });

        test('should scroll to the highlight where its text is found now', () => {
            (getHighlightShapes as jest.Mock).mockReturnValue([{ height: 10, type: 'rect', width: 20, x: 10, y: 40 }]);

            annotator.scrollToAnnotation(highlight.id);

            expect(getHighlightShapes).toHaveBeenCalledWith(contentEl, highlight.target, annotator.popupPortalEl);
            expect(scrollToLocation).toHaveBeenCalledWith(scrollEl, contentEl, { offsets: { x: 20, y: 45 } });
        });

        test('should not scroll to a highlight whose text is not found', () => {
            (getHighlightShapes as jest.Mock).mockReturnValue(null);

            annotator.scrollToAnnotation(highlight.id);

            expect(scrollToLocation).not.toHaveBeenCalled();
            expect(scrollWindowToLocation).not.toHaveBeenCalled();
        });

        test('should scroll to drawings', () => {
            annotator.scrollToAnnotation('drawing_anno_1');

            expect(scrollToLocation).toHaveBeenCalledWith(scrollEl, contentEl, { offsets: { x: 16, y: 16 } });
        });

        test('should scroll to regions', () => {
            annotator.scrollToAnnotation('anno_1');

            expect(scrollToLocation).toHaveBeenCalledWith(scrollEl, contentEl, { offsets: { x: 15, y: 15 } });
        });

        test('should scroll the content window when no ancestor scrolls', () => {
            scrollEl.style.overflowY = '';

            annotator.scrollToAnnotation('drawing_anno_1');

            expect(scrollToLocation).not.toHaveBeenCalled();
            expect(scrollWindowToLocation).toHaveBeenCalledWith(contentEl, { x: 16, y: 16 });
        });

        test('should do nothing for unknown ids', () => {
            annotator.scrollToAnnotation('nonsense');
            annotator.scrollToAnnotation(null);

            expect(scrollToLocation).not.toHaveBeenCalled();
            expect(scrollWindowToLocation).not.toHaveBeenCalled();
        });
    });
});

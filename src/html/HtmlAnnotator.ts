import BaseAnnotator, { ANNOTATION_CLASSES, Options } from '../common/BaseAnnotator';
import DeselectManager from '../common/DeselectManager';
import HtmlDrawingManager from './HtmlDrawingManager';
import HtmlHighlightManager from './HtmlHighlightManager';
import PopupManager from '../popup/PopupManager';
import { centerDrawing, isDrawing } from '../drawing';
import { centerHighlight, HighlightCreatorManager, HighlightListener, isHighlight } from '../highlight';
import { centerRegion, isRegion, RegionCreationManager, RegionManager } from '../region';
import { Event } from '../@types';
import { fetchAnnotationsAction, getAnnotation, getFileId, getIsCurrentFileVersion, Mode } from '../store';
import { getHighlightShapes, getScrollParent, getSelection, HTML_LOCATION, scrollWindowToLocation } from './htmlUtil';
import { Manager } from '../common/BaseManager';
import { scrollToLocation } from '../utils/scroll';
import './HtmlAnnotator.scss';

// Marks the content element, so rules for the mode class reach only content this annotator owns
const CONTENT_CLASS = 'ba-HtmlAnnotator-content';

// Pixels per line for wheel events that report their delta in lines
const WHEEL_LINE_HEIGHT = 16;

// Annotations fetches still in flight. Kept outside the instance because hydrate() runs in the base constructor,
// before this class's fields are initialized.
const pendingFetches = new WeakMap<HtmlAnnotator, Promise<void>>();

export type HtmlOptions = Options & {
    // The content element, treated as page 1. The container is an overlay placed over the content's scroller, and the
    // annotation UI renders there. Defaults to the container.
    contentEl?: HTMLElement;
};

/**
 * Annotates HTML content the host renders (Markdown previews), which re-wraps when the width
 * changes. Highlights are anchored on their text and drawings on the content box. The annotator only reads the
 * content's document (text, selection, input); its layers and popups always render in this page, so the content's
 * own CSS never reaches them.
 */
export default class HtmlAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLElement;

    contentEl?: HTMLElement;

    contentHeight?: number;

    contentWidth?: number;

    // The content's document, captured at init; its window is always reached through it, never kept
    contentDocument?: Document;

    highlightListener?: HighlightListener;

    isDestroyed = false;

    // The text moved without moving the content box: a scroller inside the content scrolled, or fonts loaded
    isContentScrollPending = false;

    // The content box may have moved without changing size: a scroll, or a window resize
    isScrollPending = false;

    // Clips the layers to the overlay; the popup portal stays outside it so popups near the edges are not cut off
    layersEl?: HTMLElement;

    managers: Set<Manager> = new Set();

    // A placeholder in the layers box; the layers are inserted after it as siblings
    referenceEl?: HTMLElement;

    resizeObserver?: ResizeObserver;

    updateRequestId?: number;

    private readonly canCreate: boolean;

    constructor(options: HtmlOptions) {
        super(options);

        // Controls off: skip create; existing annotations still render.
        this.canCreate = options.showAnnotationsControls !== false;
        this.contentEl = options.contentEl;

        this.addListener(Event.ANNOTATIONS_MODE_CHANGE, this.handleChangeMode);
    }

    destroy(): void {
        this.isDestroyed = true;
        this.removeListener(Event.ANNOTATIONS_MODE_CHANGE, this.handleChangeMode);

        if (this.updateRequestId) {
            window.cancelAnimationFrame(this.updateRequestId);
        }

        this.resizeObserver?.disconnect();
        this.contentDocument?.defaultView?.removeEventListener('resize', this.handleResize);
        this.contentDocument?.removeEventListener('scroll', this.handleScroll, { capture: true });
        this.contentDocument?.fonts?.removeEventListener('loadingdone', this.handleFontsLoaded);
        this.annotatedEl?.classList.remove(CONTENT_CLASS);
        this.highlightListener?.destroy();
        this.managers.forEach(manager => manager.destroy());
        this.managers.clear();
        this.layersEl?.remove();

        super.destroy();
    }

    getAnnotatedElement(): HTMLElement | null | undefined {
        return this.contentEl ?? this.containerEl;
    }

    getContentSelection = (): ReturnType<typeof getSelection> => getSelection(this.annotatedEl);

    // Relative to the layers box
    getContentBox(contentEl: HTMLElement): Partial<CSSStyleDeclaration> {
        const { height, left, top, width } = contentEl.getBoundingClientRect();
        const layersRect = this.layersEl?.getBoundingClientRect() ?? { left: 0, top: 0 };

        return {
            height: `${height}px`,
            left: `${left - layersRect.left}px`,
            top: `${top - layersRect.top}px`,
            width: `${width}px`,
        };
    }

    getManagers(contentEl: HTMLElement): Set<Manager> {
        if (this.managers.size) {
            return this.managers;
        }

        const referenceEl = this.getReferenceEl(contentEl);
        const resinTags = {
            fileid: getFileId(this.store.getState()),
            iscurrent: getIsCurrentFileVersion(this.store.getState()),
        };
        const options = {
            location: HTML_LOCATION,
            popupPortalEl: this.popupPortalEl,
            referenceEl,
            resinTags,
        };

        this.managers.add(new PopupManager(options));
        this.managers.add(new HtmlDrawingManager(options));
        this.managers.add(new RegionManager(options));

        if (this.canCreate) {
            this.managers.add(new RegionCreationManager(options));
            this.managers.add(
                new HighlightCreatorManager({
                    getSelection: this.getContentSelection,
                    referenceEl: contentEl,
                    store: this.store,
                }),
            );
        }

        this.managers.add(new HtmlHighlightManager({ ...options, contentEl }));

        return this.managers;
    }

    getReferenceEl(contentEl: HTMLElement): HTMLElement {
        if (this.referenceEl) {
            return this.referenceEl;
        }

        const containerEl = this.containerEl ?? contentEl;
        const { ownerDocument } = containerEl;

        this.layersEl = ownerDocument.createElement('div');
        this.layersEl.classList.add('ba-HtmlAnnotator-layers');
        this.referenceEl = ownerDocument.createElement('div');
        this.referenceEl.classList.add('ba-HtmlAnnotator-reference');
        this.layersEl.appendChild(this.referenceEl);
        containerEl.prepend(this.layersEl);

        return this.referenceEl;
    }

    handleChangeMode = ({ mode }: { mode: Mode }): void => {
        if (!this.annotatedEl) {
            return;
        }

        this.removeAnnotationClasses();

        const className = ANNOTATION_CLASSES[mode];
        if (className) {
            this.annotatedEl.classList.add(className);
        }
    };

    // New font metrics move the text, often without resizing the content. Only positions and highlight shapes are
    // updated: a full render would also reset the highlight creator, which clears a pending text selection.
    handleFontsLoaded = (): void => {
        this.isContentScrollPending = true;
        this.scheduleUpdate();
    };

    // A window resize can move the content box without resizing it, such as fixed-width content centered in its
    // scroller, or re-wrap its text through a media query, neither of which the content's ResizeObserver reports
    handleResize = (): void => {
        this.isContentScrollPending = true;
        this.isScrollPending = true;
        this.scheduleUpdate();
    };

    // Captured on the content's document, since scrolls of elements do not bubble. A scroller around the content moves
    // the content box; one inside it moves only the text. The capture also sees the scroll signalled on the layers box,
    // which must not schedule again.
    handleScroll = ({ target }: { target: EventTarget | null }): void => {
        if (target === this.layersEl) {
            return;
        }

        if (this.annotatedEl?.contains(target as Node)) {
            this.isContentScrollPending = true;
        }

        this.isScrollPending = true;
        this.scheduleUpdate();
    };

    // Over the overlay (while drawing, or over a highlight), the wheel would scroll what is under the overlay in this
    // page instead of the content's scroller
    handleWheel = (event: WheelEvent): void => {
        // Browsers zoom on a modified wheel, and deliver a trackpad pinch as a ctrlKey wheel
        if (event.ctrlKey || event.metaKey) {
            return;
        }

        const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? WHEEL_LINE_HEIGHT : 1;
        const view = this.contentDocument?.defaultView;

        event.preventDefault();

        if (view && this.annotatedEl) {
            (getScrollParent(this.annotatedEl) ?? view).scrollBy(event.deltaX * scale, event.deltaY * scale);
        }
    };

    protected hydrate(): void {
        // Redux dispatch method signature doesn't seem to like async actions
        const fetch = this.store.dispatch<any>(fetchAnnotationsAction()); // eslint-disable-line @typescript-eslint/no-explicit-any

        pendingFetches.set(
            this,
            Promise.resolve(fetch)
                .catch(() => undefined)
                .then(() => {
                    pendingFetches.delete(this);
                }),
        );
    }

    // The host calls init as soon as the content exists, often before the annotations arrive. Initializing marks the
    // store initialized, which emits annotations_initialized once with the annotations loaded so far, so it waits for
    // the fetch to settle.
    public init(scale = 1, rotation = 0): void {
        const pendingFetch = pendingFetches.get(this);

        if (pendingFetch) {
            pendingFetch.then(() => {
                if (!this.isDestroyed) {
                    this.init(scale, rotation);
                }
            });
            return;
        }

        super.init(scale, rotation);

        const contentEl = this.annotatedEl;
        const view = contentEl?.ownerDocument.defaultView;

        if (!contentEl || !view || this.contentDocument) {
            return;
        }

        const { ownerDocument } = contentEl;
        this.contentDocument = ownerDocument;
        contentEl.classList.add(CONTENT_CLASS);
        ownerDocument.fonts?.addEventListener('loadingdone', this.handleFontsLoaded);

        if (this.canCreate) {
            this.highlightListener = new HighlightListener({
                getSelection: this.getContentSelection,
                store: this.store,
            });
        }

        // The content's own window observes the content element's size changes
        this.resizeObserver = new view.ResizeObserver(this.scheduleUpdate);
        this.resizeObserver.observe(contentEl);

        view.addEventListener('resize', this.handleResize);
        ownerDocument.addEventListener('scroll', this.handleScroll, { capture: true, passive: true });
        this.layersEl?.addEventListener('wheel', this.handleWheel, { passive: false });
    }

    // Lets the host construct the annotator, which starts the annotations fetch, before its content exists. Call before
    // init; the content is read once, at the first init.
    public setContent({ container, contentEl }: { container: HTMLElement; contentEl?: HTMLElement }): void {
        this.container = container;
        this.contentEl = contentEl;
    }

    public postRender(): void {
        if (!this.referenceEl) {
            return;
        }

        this.deselectManager?.destroy();
        this.deselectManager = new DeselectManager({ referenceEl: this.referenceEl });
        this.deselectManager.render({ store: this.store });
    }

    render(): void {
        const contentEl = this.annotatedEl;

        if (!contentEl) {
            return;
        }

        // Before getContentBox: the first call creates the layers box the content box is measured against
        const managers = this.getManagers(contentEl);
        const contentBox = this.getContentBox(contentEl);
        this.contentHeight = contentEl.offsetHeight;
        this.contentWidth = contentEl.offsetWidth;

        managers.forEach(manager => {
            manager.style(contentBox);
            manager.render({
                callbacks: { onCopyLink: this.onCopyLink },
                intl: this.intl,
                store: this.store,
            });
        });

        this.postRender();
    }

    scheduleUpdate = (): void => {
        if (!this.updateRequestId) {
            this.updateRequestId = window.requestAnimationFrame(this.updatePositions);
        }
    };

    scrollToAnnotation(annotationId: string | null): void {
        const contentEl = this.annotatedEl;
        const annotation = annotationId ? getAnnotation(this.store.getState(), annotationId) : undefined;

        if (!annotation || !contentEl) {
            return;
        }

        let offsets = null;
        if (isRegion(annotation)) {
            offsets = centerRegion(annotation.target.shape);
        } else if (isHighlight(annotation)) {
            const shapes = getHighlightShapes(contentEl, annotation.target, this.popupPortalEl);
            offsets = shapes && centerHighlight(shapes);
        } else if (isDrawing(annotation)) {
            offsets = centerDrawing(annotation.target.path_groups);
        }

        if (!offsets) {
            return;
        }

        const scrollEl = getScrollParent(contentEl);
        if (scrollEl) {
            scrollToLocation(scrollEl, contentEl, { offsets });
        } else {
            scrollWindowToLocation(contentEl, offsets);
        }
    }

    // Scroll and resize move, re-wrap or resize the content but do not change it, so only positions are updated: the
    // layers follow the content box, and the highlight shapes, which are relative to that box, are found again when
    // its size changes (re-wrap, an opened <details>, a late image), the window resizes, or a scroller inside it moves
    // the text
    updatePositions = (): void => {
        const contentEl = this.annotatedEl;
        const isContentScrolled = this.isContentScrollPending;
        const isScrolled = this.isScrollPending;

        this.updateRequestId = undefined;
        this.isContentScrollPending = false;
        this.isScrollPending = false;

        if (!contentEl) {
            return;
        }

        const isResized = contentEl.offsetWidth !== this.contentWidth || contentEl.offsetHeight !== this.contentHeight;
        const isMoved = isResized || isContentScrolled;

        if (!isScrolled && !isMoved) {
            return;
        }

        const contentBox = this.getContentBox(contentEl);
        this.contentHeight = contentEl.offsetHeight;
        this.contentWidth = contentEl.offsetWidth;

        this.managers.forEach(manager => {
            manager.style(contentBox);

            if (isMoved && manager instanceof HtmlHighlightManager) {
                manager.updateShapes();
            }
        });

        // Popper re-places open popups on scroll of their reference's scroll parents, which include the layers box but
        // not the content's scroller. Signalled after a move too, since the highlight targets popups point at moved.
        this.layersEl?.dispatchEvent(new window.Event('scroll'));
    };
}

import BaseAnnotator from '../common/BaseAnnotator';
import BaseManager from '../common/BaseManager';
import { CLASS_ANNOTATIONS_LOADED } from '../constants';
import { getAnnotation } from '../store/annotations';
import { centerRegion, isRegion, RegionManager } from '../region';
import './DocumentAnnotator.scss';

export const SCROLL_THRESHOLD = 1000; // pixels

export default class DocumentAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLElement;

    managers: Map<number, BaseManager[]> = new Map();

    getPageManagers(pageEl: HTMLElement): BaseManager[] {
        const pageNumber = this.getPageNumber(pageEl);
        const pageReferenceEl = this.getPageReference(pageEl);
        const managers = this.managers.get(pageNumber) || [];

        // Destroy any managers that were attached to page elements that no longer exist
        if (managers.some(manager => !manager.exists(pageEl))) {
            managers.forEach(manager => manager.destroy());
            managers.length = 0;
        }

        // Lazily instantiate managers as pages are added or re-rendered
        if (managers.length === 0) {
            // Add additional managers here for other annotation types
            managers.push(new RegionManager({ page: pageNumber, pageEl, referenceEl: pageReferenceEl }));
        }

        return managers;
    }

    getPageNumber(pageEl: HTMLElement): number {
        return parseInt(pageEl.dataset.pageNumber || '', 10) || 1;
    }

    getPageReference(pageEl: HTMLElement): HTMLElement {
        const annotationsLayerEl = pageEl.querySelector('.annotationLayer') as HTMLElement;
        const canvasLayerEl = pageEl.querySelector('.canvasWrapper') as HTMLElement;
        const textLayerEl = pageEl.querySelector('.textLayer') as HTMLElement;
        return annotationsLayerEl || textLayerEl || canvasLayerEl; // Use the optional layers if they're available
    }

    getPage(pageNumber: number): HTMLElement | undefined {
        return this.getPages().find(pageEl => pageNumber === this.getPageNumber(pageEl));
    }

    getPages(): HTMLElement[] {
        // TODO: Inject page/container elements from Preview SDK rather than DOM?
        return this.annotatedEl ? Array.from(this.annotatedEl.querySelectorAll('.page')) : [];
    }

    init(scale: number): void {
        super.init(scale);

        if (!this.rootEl) {
            return;
        }

        this.annotatedEl = this.rootEl.querySelector('.bp-doc') as HTMLElement;
        this.annotatedEl.classList.add(CLASS_ANNOTATIONS_LOADED);

        this.render();
    }

    render(): void {
        this.getPages()
            .filter(({ dataset }) => dataset.loaded && dataset.pageNumber)
            .forEach(pageEl => this.renderPage(pageEl));
    }

    renderPage(pageEl: HTMLElement): void {
        const pageManagers = this.getPageManagers(pageEl);
        const pageNumber = this.getPageNumber(pageEl);

        // Render annotations for every page
        pageManagers.forEach(manager =>
            manager.render({
                intl: this.intl,
                scale: this.scale,
                store: this.store,
            }),
        );

        this.managers.set(pageNumber, pageManagers);
    }

    scrollToAnnotation(annotationId: string | null): void {
        if (!annotationId) {
            return;
        }

        const annotation = getAnnotation(this.store.getState(), annotationId);
        const annotationPage = annotation?.target.location.value;

        if (!annotation || !annotationPage) {
            return;
        }

        if (isRegion(annotation)) {
            this.scrollToLocation(annotationPage, centerRegion(annotation.target.shape));
        }
    }

    scrollToLocation(page = 1, { x: offsetX, y: offsetY } = { x: 0, y: 0 }): void {
        const pageEl = this.getPage(page);

        if (!this.annotatedEl || !pageEl) {
            return;
        }

        const canSmoothScroll = 'scrollBehavior' in this.annotatedEl.style;
        const parentCenterX = this.annotatedEl.clientWidth / 2;
        const parentCenterY = this.annotatedEl.clientHeight / 2;
        const offsetCenterX = Math.round(offsetX * this.scale);
        const offsetCenterY = Math.round(offsetY * this.scale);
        const offsetScrollLeft = pageEl.offsetLeft - parentCenterX + offsetCenterX;
        const offsetScrollTop = pageEl.offsetTop - parentCenterY + offsetCenterY;
        const scrollLeft = Math.max(0, Math.min(offsetScrollLeft, this.annotatedEl.scrollWidth));
        const scrollTop = Math.max(0, Math.min(offsetScrollTop, this.annotatedEl.scrollHeight));

        if (canSmoothScroll && Math.abs(this.annotatedEl.scrollTop - scrollTop) < SCROLL_THRESHOLD) {
            this.annotatedEl.scrollTo({
                behavior: 'smooth',
                left: scrollLeft,
                top: scrollTop,
            });
        } else {
            this.annotatedEl.scrollLeft = scrollLeft;
            this.annotatedEl.scrollTop = scrollTop;
        }
    }
}

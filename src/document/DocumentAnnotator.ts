import BaseAnnotator, { ANNOTATION_CLASSES, Options } from '../common/BaseAnnotator';
import PopupManager from '../popup/PopupManager';
import { centerDrawing, DrawingManager, isDrawing } from '../drawing';
import {
    centerHighlight,
    HighlightCreatorManager,
    HighlightListener,
    HighlightManager,
    isHighlight,
} from '../highlight';
import { centerRegion, isRegion, RegionCreationManager, RegionManager } from '../region';
import { Event } from '../@types';
import { getAnnotation } from '../store/annotations';
import { getSelection } from './docUtil';
import { Manager } from '../common/BaseManager';
import { getIsCurrentFileVersion, Mode } from '../store';
import { scrollToLocation } from '../utils/scroll';
import './DocumentAnnotator.scss';

// Pdf.js textLayer enhancement requires waiting for 300ms (they hardcode this magic number)
const TEXT_LAYER_ENHANCEMENT = 300;

export default class DocumentAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLElement;

    highlightListener?: HighlightListener;

    managers: Map<number, Set<Manager>> = new Map();

    constructor(options: Options) {
        super(options);

        this.highlightListener = new HighlightListener({ getSelection, store: this.store });

        this.addListener(Event.ANNOTATIONS_MODE_CHANGE, this.handleChangeMode);
    }

    destroy(): void {
        this.removeListener(Event.ANNOTATIONS_MODE_CHANGE, this.handleChangeMode);

        if (this.highlightListener) {
            this.highlightListener.destroy();
        }

        if (this.managers) {
            this.managers.forEach(managers => managers.forEach(manager => manager.destroy()));
        }

        super.destroy();
    }

    getAnnotatedElement(): HTMLElement | null | undefined {
        return this.containerEl?.querySelector('.bp-doc');
    }

    getPageManagers(pageEl: HTMLElement): Set<Manager> {
        const isCurrentFileVersion = getIsCurrentFileVersion(this.store.getState());
        const pageNumber = this.getPageNumber(pageEl);
        const pageReferenceEl = this.getPageReference(pageEl);
        const managers = this.managers.get(pageNumber) || new Set();
        const resinTags = { iscurrent: isCurrentFileVersion };

        // Destroy any managers that were attached to page elements that no longer exist
        managers.forEach(manager => {
            if (!manager.exists(pageEl)) {
                manager.destroy();
                managers.delete(manager);
            }
        });

        // Lazily instantiate managers as pages are added or re-rendered
        if (managers.size === 0) {
            managers.add(new PopupManager({ location: pageNumber, referenceEl: pageReferenceEl, resinTags }));

            if (this.isFeatureEnabled('drawing')) {
                managers.add(new DrawingManager({ location: pageNumber, referenceEl: pageReferenceEl, resinTags }));
            }

            const textLayer = pageEl.querySelector('.textLayer') as HTMLElement;

            if (textLayer) {
                managers.add(
                    new HighlightCreatorManager({
                        getSelection,
                        referenceEl: textLayer,
                        selectionChangeDelay: TEXT_LAYER_ENHANCEMENT,
                        store: this.store,
                    }),
                );
            }

            managers.add(new HighlightManager({ location: pageNumber, referenceEl: pageReferenceEl, resinTags }));

            managers.add(new RegionManager({ location: pageNumber, referenceEl: pageReferenceEl, resinTags }));

            const canvasLayerEl = pageEl.querySelector<HTMLElement>('.canvasWrapper');
            const referenceEl =
                this.isFeatureEnabled('discoverability') && canvasLayerEl ? canvasLayerEl : pageReferenceEl;

            managers.add(new RegionCreationManager({ location: pageNumber, referenceEl, resinTags }));
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

    handleChangeMode = ({ mode }: { mode: Mode }): void => {
        if (!this.annotatedEl) {
            return;
        }

        this.removeAnnotationClasses();

        const annotatedElement = this.annotatedEl;
        const className = ANNOTATION_CLASSES[mode];
        if (className) {
            annotatedElement.classList.add(className);
        }
    };

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
        const annotationPage = annotation?.target.location.value ?? 1;
        const annotationPageEl = this.getPage(annotationPage);

        if (!annotation || !annotationPage || !annotationPageEl || !this.annotatedEl) {
            return;
        }

        let offsets = null;
        if (isRegion(annotation)) {
            offsets = centerRegion(annotation.target.shape);
        } else if (isHighlight(annotation)) {
            offsets = centerHighlight(annotation.target.shapes);
        } else if (isDrawing(annotation)) {
            offsets = centerDrawing(annotation.target.path_groups);
        }

        if (offsets) {
            scrollToLocation(this.annotatedEl, annotationPageEl, { offsets });
        }
    }
}

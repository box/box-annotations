import BaseAnnotator, { ANNOTATION_CLASSES, Options } from '../common/BaseAnnotator';
import BaseManager from '../common/BaseManager';
import PopupManager from '../popup/PopupManager';
import { centerHighlight, isHighlight } from '../highlight/highlightUtil';
import { centerRegion, isRegion, RegionManager } from '../region';
import { Event } from '../@types';
import { getAnnotation } from '../store/annotations';
import { getSelection } from './docUtil';
import { HighlightCreatorManager, HighlightListener, HighlightManager } from '../highlight';
import { Mode } from '../store';
import { scrollToLocation } from '../utils/scroll';
import './DocumentAnnotator.scss';

// Pdf.js textLayer enhancement requires waiting for 300ms (they hardcode this magic number)
const TEXT_LAYER_ENHANCEMENT = 300;

export default class DocumentAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLElement;

    highlightListener?: HighlightListener;

    managers: Map<number, Set<BaseManager>> = new Map();

    constructor(options: Options) {
        super(options);

        if (this.isFeatureEnabled('highlightText')) {
            this.highlightListener = new HighlightListener({ getSelection, store: this.store });
        }

        this.addListener(Event.ANNOTATIONS_MODE_CHANGE, this.handleChangeMode);
    }

    destroy(): void {
        this.removeListener(Event.ANNOTATIONS_MODE_CHANGE, this.handleChangeMode);

        if (this.highlightListener) {
            this.highlightListener.destroy();
        }

        super.destroy();
    }

    getAnnotatedElement(): HTMLElement | null | undefined {
        return this.containerEl?.querySelector('.bp-doc');
    }

    getPageManagers(pageEl: HTMLElement): Set<BaseManager> {
        const pageNumber = this.getPageNumber(pageEl);
        const pageReferenceEl = this.getPageReference(pageEl);
        const managers = this.managers.get(pageNumber) || new Set();

        // Destroy any managers that were attached to page elements that no longer exist
        managers.forEach(manager => {
            if (!manager.exists(pageEl)) {
                manager.destroy();
                managers.delete(manager);
            }
        });

        // Lazily instantiate managers as pages are added or re-rendered
        if (managers.size === 0) {
            managers.add(new PopupManager({ location: pageNumber, referenceEl: pageReferenceEl }));

            if (this.isFeatureEnabled('highlightText')) {
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

                managers.add(new HighlightManager({ location: pageNumber, referenceEl: pageReferenceEl }));
            }

            const canvasLayerEl = pageEl.querySelector<HTMLElement>('.canvasWrapper');
            const referenceEl =
                this.isFeatureEnabled('discoverability') && canvasLayerEl ? canvasLayerEl : pageReferenceEl;

            managers.add(new RegionManager({ location: pageNumber, referenceEl }));
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

        if (isRegion(annotation)) {
            scrollToLocation(this.annotatedEl, annotationPageEl, {
                offsets: centerRegion(annotation.target.shape),
            });
        } else if (isHighlight(annotation)) {
            scrollToLocation(this.annotatedEl, annotationPageEl, {
                offsets: centerHighlight(annotation.target.shapes),
            });
        }
    }
}

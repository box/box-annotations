// @flow
import BaseAnnotator, { Options } from '../common/BaseAnnotator';
import BaseManager from '../common/BaseManager';
import { LegacyEvent } from '../@types';
import { CLASS_ANNOTATIONS_LOADED } from '../constants';
import { RegionManager } from '../region';

import './DocumentAnnotator.scss';

export default class DocumentAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLElement;

    managers: Map<number, BaseManager[]> = new Map();

    constructor(options: Options) {
        super(options);

        this.hydrate(options);
    }

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
        const canvasLayerEl = pageEl.querySelector('.canvasWrapper') as HTMLElement;
        const textLayerEl = pageEl.querySelector('.textLayer') as HTMLElement;
        return textLayerEl || canvasLayerEl; // Use the optional text layer if it's available
    }

    getPages(): HTMLElement[] {
        // TODO: Inject page/container elements from Preview SDK rather than DOM?
        return this.annotatedEl ? Array.from(this.annotatedEl.querySelectorAll('.page')) : [];
    }

    hydrate({ file }: Options): void {
        this.api
            .fetchAnnotations(file.file_version.id)
            .then(() => {
                // TODO: Normalize response, set in store, and render
            })
            .catch(error => {
                this.emit(LegacyEvent.ERROR, error);
            });
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
}

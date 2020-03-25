// @flow
import BaseAnnotator, { Options } from '../common/BaseAnnotator';
import BaseManager from '../common/BaseManager';
import RegionManager from '../region/RegionManager';
import { ANNOTATOR_EVENT, CLASS_ANNOTATIONS_LOADED } from '../constants';

export default class DocumentAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLElement;

    annotations: Record<string, []> = {};

    managers: Map<string, BaseManager[]> = new Map();

    constructor(options: Options) {
        super(options);

        this.hydrate(options);
    }

    getPageManagers(pageEl: HTMLElement): BaseManager[] {
        const pageNumber = this.getPageNumber(pageEl);
        const managers = this.managers.get(pageNumber) || [];

        // Destroy any managers that were attached to page elements that no longer exist
        if (managers.some(manager => !manager.exists(pageEl))) {
            managers.forEach(manager => manager.destroy());
            managers.length = 0;
        }

        // Lazily instantiate managers as pages are added or re-rendered
        if (managers.length === 0) {
            // Add additional managers here for other annotation types
            managers.push(new RegionManager({ page: pageNumber, pageEl }));
        }

        return managers;
    }

    getPageNumber(pageEl: HTMLElement): string {
        return pageEl.dataset.pageNumber || '1';
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
                this.emit(ANNOTATOR_EVENT.error, error);
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

        // Render annotations for every page (can be updated with visibility detection)
        pageManagers.forEach(manager =>
            manager.render({
                annotations: this.annotations[pageNumber],
                scale: this.scale,
            }),
        );

        this.managers.set(pageNumber, pageManagers);
    }
}

import { Unsubscribe } from 'redux';
import BaseAnnotator, { Options } from '../common/BaseAnnotator';
import PopupManager from '../popup/PopupManager';
import { BoundingBoxHighlightManager } from '../boundingBoxHighlight';
import { centerDrawing, DrawingManager, isDrawing } from '../drawing';
import { centerRegion, isRegion, RegionCreationManager, RegionManager } from '../region';
import { CreatorStatus, getCreatorStatus } from '../store/creator';
import { getAnnotation, getFileId, getIsCurrentFileVersion, getRotation, getViewMode } from '../store';
import { getRotatedPosition } from '../utils/rotate';
import { Manager } from '../common/BaseManager';
import { scrollToLocation } from '../utils/scroll';
import './ImageAnnotator.scss';

import type { ViewMode } from '../store/options/types';

export const CSS_IS_DRAWING_CLASS = 'ba-is-drawing';

export default class ImageAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLElement;

    managers: Set<Manager> = new Set();

    /** Tracks which view mode the current managers were created for. Used to destroy/recreate when switching. */
    private managersViewMode: ViewMode | null = null;

    storeHandler?: Unsubscribe;

    constructor(options: Options) {
        super(options);

        this.storeHandler = this.store.subscribe(this.handleStore);
    }

    destroy(): void {
        if (this.storeHandler) {
            this.storeHandler();
        }

        if (this.managers) {
            this.managers.forEach(manager => manager.destroy());
        }

        super.destroy();
    }

    getAnnotatedElement(): HTMLElement | null | undefined {
        return this.containerEl?.querySelector('.bp-image');
    }

    /** Destroys all managers and clears the cache. Call when switching view modes. */
    private clearManagers(): void {
        this.managers.forEach(manager => manager.destroy());
        this.managers.clear();
        this.managersViewMode = null;
    }

    getManagers(parentEl: HTMLElement, referenceEl: HTMLElement): Set<Manager> {
        const fileId = getFileId(this.store.getState());
        const isCurrentFileVersion = getIsCurrentFileVersion(this.store.getState());
        const resinTags = { fileid: fileId, iscurrent: isCurrentFileVersion };
        const viewMode = getViewMode(this.store.getState());

        this.managers.forEach(manager => {
            if (!manager.exists(parentEl)) {
                manager.destroy();
                this.managers.delete(manager);
            }
        });

        if (this.managers.size === 0) {
            if (viewMode === 'boundingBoxes') {
                this.managers.add(new BoundingBoxHighlightManager({ location: 1, referenceEl, resinTags }));
                return this.managers;
            }

            this.managers.add(new PopupManager({ referenceEl, resinTags }));
            this.managers.add(new DrawingManager({ referenceEl, resinTags }));
            this.managers.add(new RegionManager({ referenceEl, resinTags }));
            this.managers.add(new RegionCreationManager({ referenceEl, resinTags }));
        }

        return this.managers;
    }

    getReference(): HTMLElement | null | undefined {
        return this.annotatedEl?.querySelector('img');
    }

    handleStore = (): void => {
        const referenceEl = this.getReference();

        if (!referenceEl) {
            return;
        }

        if (getCreatorStatus(this.store.getState()) === CreatorStatus.started) {
            referenceEl.classList.add(CSS_IS_DRAWING_CLASS);
        } else {
            referenceEl.classList.remove(CSS_IS_DRAWING_CLASS);
        }
    };

    render(): void {
        const referenceEl = this.getReference();
        const rotation = getRotation(this.store.getState()) || 0;
        const viewMode = getViewMode(this.store.getState());

        if (!this.annotatedEl || !referenceEl) {
            return;
        }

        if (this.managersViewMode !== null && this.managersViewMode !== viewMode) {
            this.clearManagers();
        }
        this.managersViewMode = viewMode;

        this.getManagers(this.annotatedEl, referenceEl).forEach(manager => {
            manager.style({
                height: `${referenceEl.offsetHeight}px`,
                left: `${referenceEl.offsetLeft}px`,
                top: `${referenceEl.offsetTop}px`,
                transform: `rotate(${rotation}deg)`,
                width: `${referenceEl.offsetWidth}px`,
            });

            manager.render({
                intl: this.intl,
                store: this.store,
            });
        });

        this.postRender();
    }

    public postRender(): void {
        // DeselectManager is only needed for annotation creation; skip in bounding box mode.
        if (getViewMode(this.store.getState()) === 'boundingBoxes') {
            if (this.deselectManager) {
                this.deselectManager.destroy();
                this.deselectManager = null;
            }
            return;
        }
        super.postRender();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getScrollReferenceForHighlight(): HTMLElement | null | undefined {
        return this.getReference();
    }

    protected getAdjustedScrollOffsets(offsets: { x: number; y: number }): { x: number; y: number } {
        const rotation = getRotation(this.store.getState()) || 0;
        return getRotatedPosition(offsets, rotation);
    }

    scrollToAnnotation(annotationId: string | null): void {
        if (!annotationId) {
            return;
        }

        const annotation = getAnnotation(this.store.getState(), annotationId);
        const annotationLocation = annotation?.target.location.value ?? 1;
        const referenceEl = this.getReference();
        const rotation = getRotation(this.store.getState()) || 0;

        if (!annotation || !annotationLocation || !referenceEl || !this.annotatedEl) {
            return;
        }

        let offsets = null;
        if (isRegion(annotation)) {
            offsets = centerRegion(annotation.target.shape);
        } else if (isDrawing(annotation)) {
            offsets = centerDrawing(annotation.target.path_groups);
        }

        if (offsets) {
            scrollToLocation(this.annotatedEl, referenceEl, {
                offsets: getRotatedPosition(offsets, rotation),
            });
        }
    }
}

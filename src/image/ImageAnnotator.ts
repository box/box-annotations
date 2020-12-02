import { Unsubscribe } from 'redux';
import BaseAnnotator, { Options } from '../common/BaseAnnotator';
import PopupManager from '../popup/PopupManager';
import { centerDrawing, DrawingManager, isDrawing } from '../drawing';
import { centerRegion, isRegion, RegionCreationManager, RegionManager } from '../region';
import { CreatorStatus, getCreatorStatus } from '../store/creator';
import { getAnnotation, getIsCurrentFileVersion, getRotation } from '../store';
import { getRotatedPosition } from '../utils/rotate';
import { Manager } from '../common/BaseManager';
import { scrollToLocation } from '../utils/scroll';
import './ImageAnnotator.scss';

export const CSS_IS_DRAWING_CLASS = 'ba-is-drawing';

export default class ImageAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLElement;

    managers: Set<Manager> = new Set();

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

    getManagers(parentEl: HTMLElement, referenceEl: HTMLElement): Set<Manager> {
        const isCurrentFileVersion = getIsCurrentFileVersion(this.store.getState());
        const resinTags = { iscurrent: isCurrentFileVersion };

        this.managers.forEach(manager => {
            if (!manager.exists(parentEl)) {
                manager.destroy();
                this.managers.delete(manager);
            }
        });

        if (this.managers.size === 0) {
            this.managers.add(new PopupManager({ referenceEl, resinTags }));
            if (this.isFeatureEnabled('drawing')) {
                this.managers.add(new DrawingManager({ referenceEl, resinTags }));
            }
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

        if (!this.annotatedEl || !referenceEl) {
            return;
        }

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

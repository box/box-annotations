import { Unsubscribe } from 'redux';
import BaseAnnotator, { Options } from '../common/BaseAnnotator';
import BaseManager from '../common/BaseManager';
import PopupManager from '../popup/PopupManager';
import { getAnnotation, getRotation } from '../store';
import { centerRegion, getTransformedShape, isRegion, RegionManager } from '../region';
import { CreatorStatus, getCreatorStatus } from '../store/creator';
import { scrollToLocation } from '../utils/scroll';
import './ImageAnnotator.scss';

export const CSS_IS_DRAWING_CLASS = 'ba-is-drawing';

export default class ImageAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLElement;

    managers: Set<BaseManager> = new Set();

    storeHandler?: Unsubscribe;

    constructor(options: Options) {
        super(options);

        this.storeHandler = this.store.subscribe(this.handleStore);
    }

    destroy(): void {
        if (this.storeHandler) {
            this.storeHandler();
        }

        super.destroy();
    }

    getAnnotatedElement(): HTMLElement | null | undefined {
        return this.containerEl?.querySelector('.bp-image');
    }

    getManagers(parentEl: HTMLElement, referenceEl: HTMLElement): Set<BaseManager> {
        this.managers.forEach(manager => {
            if (!manager.exists(parentEl)) {
                manager.destroy();
                this.managers.delete(manager);
            }
        });

        if (this.managers.size === 0) {
            this.managers.add(new PopupManager({ referenceEl }));
            this.managers.add(new RegionManager({ referenceEl }));
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

        if (isRegion(annotation)) {
            const transformedShape = getTransformedShape(annotation.target.shape, rotation);

            scrollToLocation(this.annotatedEl, referenceEl, {
                offsets: centerRegion(transformedShape),
            });
        }
    }
}

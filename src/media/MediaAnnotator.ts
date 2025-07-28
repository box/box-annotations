import { Unsubscribe } from 'redux';
import BaseAnnotator, { Options } from '../common/BaseAnnotator';
import PopupManager from '../popup/PopupManager';
import { DrawingManager } from '../drawing';
import { RegionCreationManager, RegionManager } from '../region';
import { CreatorStatus, getCreatorStatus } from '../store/creator';
import { addLocalAnnotationAction, getFileId, getIsCurrentFileVersion, getRotation } from '../store';
import { Manager } from '../common/BaseManager';
import './MediaAnnotator.scss';

export const CSS_IS_DRAWING_CLASS = 'ba-is-drawing';

export default class MediaAnnotator extends BaseAnnotator {
    annotatedEl?: HTMLVideoElement;

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
        return this.containerEl?.querySelector('.bp-media');
    }

    getManagers(parentEl: HTMLElement, referenceEl: HTMLElement): Set<Manager> {
        const fileId = getFileId(this.store.getState());
        const isCurrentFileVersion = getIsCurrentFileVersion(this.store.getState());
        const resinTags = { fileid: fileId, iscurrent: isCurrentFileVersion };

        this.managers.forEach(manager => {
            if (!manager.exists(parentEl)) {
                manager.destroy();
                this.managers.delete(manager);
            }
        });

        if (this.managers.size === 0) {
            this.managers.add(new PopupManager({ referenceEl, resinTags, targetType : 'frame'}));
            this.managers.add(new DrawingManager({ referenceEl, resinTags }));
            this.managers.add(new RegionManager({ referenceEl, resinTags }));
            this.managers.add(new RegionCreationManager({ referenceEl, resinTags }));
        }

        return this.managers;
    }

    getReference(): HTMLVideoElement | null | undefined {
        return this.annotatedEl?.querySelector('video');
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

        this.postRender();
    }

    scrollToAnnotation(annotationId: string | null): void {
        if (!annotationId) {
            return;
        }




        // Try to get the annotation from local storage using the annotationId as the key
        let annotation = null;
        const storedAnnotation = localStorage.getItem(annotationId);

        if (storedAnnotation) {
            try {
                annotation = JSON.parse(storedAnnotation);
                this.store.dispatch(addLocalAnnotationAction(annotation));
                const time = annotation.target.location.value;
            } catch (e) {
                // If parsing fails, ignore and fallback to store
                annotation = null;
            }

        }
    //    const annotation = getAnnotation(this.store.getState(), annotationId);
        const annotationLocation = annotation?.target.location.value ?? 0
        const video = this.getReference();
        if (!annotation || !annotationLocation || !video || !this.annotatedEl) {
            return;
        }

      
        if (video) {
            video.currentTime = annotationLocation;
            video.pause();
        }
    }
}


import { Unsubscribe } from 'redux';
import BaseAnnotator, { Options } from '../common/BaseAnnotator';
import PopupManager from '../popup/PopupManager';
import { DrawingManager } from '../drawing';
import { RegionCreationManager, RegionManager } from '../region';
import { CreatorStatus, getCreatorStatus } from '../store/creator';
import { getAnnotation, getFileId, getIsCurrentFileVersion, getRotation } from '../store';
import { Manager } from '../common/BaseManager';
import './MediaAnnotator.scss';
import { MEDIA_LOCATION_INDEX, FRAME } from '../constants';

export const CSS_IS_DRAWING_CLASS = 'ba-is-drawing';

export default class MediaAnnotator extends BaseAnnotator {
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
        return this.containerEl?.querySelector('.bp-media');
    }


    getTimeStamp(): number {
        const referenceEl = this.getReference();
        return referenceEl?.currentTime ?? 0;
    }


    getManagers(parentEl: HTMLElement, referenceEl: HTMLVideoElement): Set<Manager> {
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
            this.managers.add(new PopupManager({ location: MEDIA_LOCATION_INDEX,   referenceEl, resinTags, targetType : FRAME}));
            this.managers.add(new DrawingManager({ location: MEDIA_LOCATION_INDEX, referenceEl, resinTags, targetType : FRAME}));
            this.managers.add(new RegionManager({ location: MEDIA_LOCATION_INDEX, referenceEl, resinTags, targetType : FRAME}));
            this.managers.add(new RegionCreationManager({ location: MEDIA_LOCATION_INDEX, referenceEl, resinTags, targetType : FRAME}));
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

        const annotation = getAnnotation(this.store.getState(), annotationId);
        const annotationLocation = annotation?.target.location.value ?? 0
        const video = this.getReference();
        if (!annotation || !video || !this.annotatedEl) {
            return;
        }
  
        video.pause();
        video.currentTime = annotationLocation / 1000;
        
    }
}


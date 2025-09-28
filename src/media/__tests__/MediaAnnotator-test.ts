import DeselectManager from '../../common/DeselectManager';
import DrawingManager from '../../drawing/DrawingManager';
import MediaAnnotator, { CSS_IS_DRAWING_CLASS } from '../MediaAnnotator';
import PopupManager from '../../popup/PopupManager';
import RegionCreationManager from '../../region/RegionCreationManager';
import RegionManager from '../../region/RegionManager';
import { Annotation } from '../../@types';
import { CreatorStatus, fetchAnnotationsAction, setStatusAction } from '../../store';
import { videoAnnotations as drawings } from '../../drawing/__mocks__/drawingData';
import { videoAnnotations as regions } from '../../region/__mocks__/data';

jest.mock('../../common/DeselectManager');
jest.mock('../../popup/PopupManager');
jest.mock('../../region/RegionCreationManager');
jest.mock('../../region/RegionManager');

describe('MediaAnnotator', () => {
    const container = document.createElement('div');
  
    const defaults = {
        apiHost: 'https://api.box.com',
        container,
        file: {
            id: '12345',
            file_version: { id: '98765' },
            permissions: {
                can_create_annotations: true,
                can_view_annotations: true,
            },
        },
        intl: {
            messages: {},
        },
        locale: 'en-US',
        token: '1234567890',
    };

    const mockVideo = {
        pause: jest.fn(),
        currentTime: 0,
        offsetHeight: 100,
        offsetLeft: 50,
        offsetTop: 50,
        offsetWidth: 100,
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn(),
            item: jest.fn(),
            toggle: jest.fn(),
            length: 0,
            value: '',
            replace: jest.fn(),
            supports: jest.fn(),
            forEach: jest.fn(),
        },
    };
    const getAnnotator = (options = {}): MediaAnnotator => new MediaAnnotator({ ...defaults, ...options });
    const getVideo = (): HTMLVideoElement => {
        const video = container.querySelector('video') as HTMLVideoElement;

        Object.defineProperty(video, 'offsetHeight', { configurable: true, value: 100 });
        Object.defineProperty(video, 'offsetLeft', { configurable: true, value: 50 });
        Object.defineProperty(video, 'offsetTop', { configurable: true, value: 50 });
        Object.defineProperty(video, 'offsetWidth', { configurable: true, value: 100 });

        return video;
    };
    const getParent = (): HTMLElement => container.querySelector('.bp-media') as HTMLElement;
    const mockManager = {
        destroy: jest.fn(),
        exists: jest.fn(),
        render: jest.fn(),
        style: jest.fn(),
    };

    let annotator = getAnnotator();

    beforeEach(() => {
        container.classList.add('bp');
        container.innerHTML = `
            <div class="bp-media">
              <video preload="auto" playsinline="" style="width: 934px;">
              <source src="blob:https://app.app-bfoxx.monolith-devpod.apps-global.gcp001.dev.box.net/c9beafc4-42ad-4747-b212-0c0cd3a50ee6" type=""></video>
            </div>
        `;

        annotator = getAnnotator();
    });

    afterEach(() => {
        if (annotator) {
            annotator.destroy();
        }
    });

    describe('destroy', () => {
        test('should unsubscribe from the store', () => {
            jest.spyOn(annotator, 'storeHandler');

            annotator.destroy();

            expect(annotator.storeHandler).toHaveBeenCalled();
        });

        test('should destroy all managers', () => {
            annotator.managers = new Set([mockManager]);

            annotator.destroy();

            expect(mockManager.destroy).toHaveBeenCalled();
        });
    });

    describe('getManagers()', () => {
        test('should create new managers if they are not present in the annotated element', () => {
            const managers = annotator.getManagers(getParent(), getVideo());
            const managerIterator = managers.values();

            expect(managerIterator.next().value).toBeInstanceOf(PopupManager);
            expect(managerIterator.next().value).toBeInstanceOf(DrawingManager);
            expect(managerIterator.next().value).toBeInstanceOf(RegionManager);
            expect(managerIterator.next().value).toBeInstanceOf(RegionCreationManager);
        });

        test('should destroy any existing managers if they are not present in the annotated element', () => {
            mockManager.exists.mockReturnValue(false);
            annotator.managers = new Set([mockManager]);

            const managers = annotator.getManagers(getParent(), getVideo());

            expect(mockManager.exists).toHaveBeenCalled();
            expect(mockManager.destroy).toHaveBeenCalled();
            expect(managers.values().next().value).not.toEqual(mockManager);
        });

        test('should return the existing managers if they already exist in the annotated element', () => {
            mockManager.exists.mockReturnValue(true);
            annotator.managers = new Set([mockManager]);

            const managers = annotator.getManagers(getParent(), getVideo());

            expect(mockManager.exists).toHaveBeenCalled();
            expect(mockManager.destroy).not.toHaveBeenCalled();
            expect(managers.values().next().value).toEqual(mockManager);
        });
    });

    describe('getReference()', () => {
        beforeEach(() => {
            jest.spyOn(annotator, 'getManagers').mockImplementation(() => new Set([mockManager]));
        });

        test('should return the underlying image element', () => {
            annotator.init(1);

            expect(annotator.getReference()).toBe(container.querySelector('video'));
        });
    });

    describe('handleStore', () => {
        test('should update the reference element with the correct class', () => {
            jest.spyOn(annotator, 'getReference').mockImplementation(getVideo);

            annotator.store.dispatch(setStatusAction(CreatorStatus.init));
            expect(getVideo().classList).not.toContain(CSS_IS_DRAWING_CLASS);

            annotator.store.dispatch(setStatusAction(CreatorStatus.started));
            expect(getVideo().classList).toContain(CSS_IS_DRAWING_CLASS);

            annotator.store.dispatch(setStatusAction(CreatorStatus.pending));
            expect(getVideo().classList).not.toContain(CSS_IS_DRAWING_CLASS);
        });
    });

    describe('init()', () => {
        beforeEach(() => {
            jest.spyOn(annotator, 'render');
            jest.spyOn(annotator, 'getManagers').mockImplementation(() => new Set([mockManager]));
        });

        test('should do nothing if the root element is not defined', () => {
            annotator.container = '#nonsense';
            annotator.init(2);

            expect(annotator.render).not.toHaveBeenCalled();
        });

        test('should set the root and annotated element based on class name', () => {
            annotator.init(2);

            expect(annotator.containerEl).toBe(container);
            expect(annotator.annotatedEl).toBe(getParent());
            expect(annotator.render).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        beforeEach(() => {
            jest.spyOn(annotator, 'getManagers').mockImplementation(() => new Set([mockManager]));
            jest.spyOn(annotator, 'getReference').mockImplementation(getVideo);
        });

        test('should initialize a manager for the video element', () => {
            annotator.init(1);

            expect(annotator.getManagers).toHaveBeenCalled();
            expect(mockManager.render).toHaveBeenCalledWith({
                intl: annotator.intl,
                store: expect.any(Object),
            });
            expect(mockManager.style).toHaveBeenCalledWith({
                height: '100px',
                left: '50px',
                top: '50px',
                transform: 'rotate(0deg)',
                width: '100px',
            });
        });

        test('should do nothing if the annotated element is not defined', () => {
            annotator.annotatedEl = undefined;
            annotator.render();

            expect(annotator.getManagers).not.toHaveBeenCalled();
            expect(mockManager.render).not.toHaveBeenCalled();
            expect(mockManager.style).not.toHaveBeenCalled();
        });

        test('should do nothing if the reference image element is not defined', () => {
            annotator.getReference = jest.fn();
            annotator.init(1);
            annotator.render();

            expect(annotator.getManagers).not.toHaveBeenCalled();
            expect(mockManager.render).not.toHaveBeenCalled();
            expect(mockManager.style).not.toHaveBeenCalled();
        });

        test('should instantiate the DeselectManager and call render', () => {
            annotator.annotatedEl = getParent();

            expect(annotator.deselectManager).toBeNull();

            annotator.render();

            expect(annotator.deselectManager).toBeInstanceOf(DeselectManager);
            expect(annotator.deselectManager!.render).toHaveBeenCalled();
        });
    });

    describe('scrollToAnnotation()', () => {
        beforeEach(() => {
            const payload = {
                entries: [...regions, ...drawings] as Annotation[],
                limit: 1000,
                next_marker: null,
                previous_marker: null,
            };

            annotator.annotatedEl = getParent();
            annotator.getReference = jest.fn().mockReturnValue(mockVideo);
            annotator.store.dispatch(fetchAnnotationsAction.fulfilled(payload, 'test', undefined));
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test('should call scrollToLocation for region annotations', () => {
            annotator.scrollToAnnotation('video_region_anno_1');
 
            expect(mockVideo.currentTime).toBe(10);
            annotator.scrollToAnnotation('video_region_anno_2');
            expect(mockVideo.currentTime).toBe(20);
            annotator.scrollToAnnotation('video_region_anno_3');
            expect(mockVideo.currentTime).toBe(30);
            expect(mockVideo.pause).toHaveBeenCalledTimes(3);
        });

        test('should call scrollToLocation for drawing anntotations', () => {
            annotator.scrollToAnnotation('video_drawing_anno_1');
            expect(mockVideo.pause).toHaveBeenCalled();
            expect(mockVideo.currentTime).toBe(10);
            annotator.scrollToAnnotation('video_drawing_anno_2');
            expect(mockVideo.currentTime).toBe(20);
            annotator.scrollToAnnotation('video_drawing_anno_3');
            expect(mockVideo.currentTime).toBe(30);
            expect(mockVideo.pause).toHaveBeenCalledTimes(3);
        });

        test('should do nothing if the annotation id is undefined or not available in the store', () => {
            annotator.scrollToAnnotation('nonsense');
            expect(mockVideo.pause).not.toHaveBeenCalled();
        });
    });
});

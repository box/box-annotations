import ImageAnnotator, { CSS_IS_DRAWING_CLASS } from '../ImageAnnotator';
import RegionManager from '../../region/RegionManager';
import { Annotation } from '../../@types';
import { CreatorStatus, fetchAnnotationsAction, setStatusAction } from '../../store';
import { annotations as regions } from '../../region/__mocks__/data';
import { scrollToLocation } from '../../utils/scroll';

jest.mock('../../region/RegionManager');
jest.mock('../../utils/scroll');

describe('ImageAnnotator', () => {
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
    const getAnnotator = (options = {}): ImageAnnotator => new ImageAnnotator({ ...defaults, ...options });
    const getImage = (): HTMLElement => {
        const image = container.querySelector('.image') as HTMLElement;

        Object.defineProperty(image, 'offsetHeight', { configurable: true, value: 100 });
        Object.defineProperty(image, 'offsetLeft', { configurable: true, value: 50 });
        Object.defineProperty(image, 'offsetTop', { configurable: true, value: 50 });
        Object.defineProperty(image, 'offsetWidth', { configurable: true, value: 100 });

        return image;
    };
    const getParent = (): HTMLElement => container.querySelector('.bp-image') as HTMLElement;
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
            <div class="bp-image">
                <img alt="test" class="image" src="data:image/png;base64, test" />
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
    });

    describe('getManagers()', () => {
        test('should create new managers if they are not present in the annotated element', () => {
            const managers = annotator.getManagers(getParent(), getImage());

            expect(managers.size).toBe(1);
            expect(managers.values().next().value).toBeInstanceOf(RegionManager);
        });

        test('should destroy any existing managers if they are not present in the annotated element', () => {
            mockManager.exists.mockReturnValue(false);
            annotator.managers = new Set([mockManager]);

            const managers = annotator.getManagers(getParent(), getImage());

            expect(mockManager.exists).toHaveBeenCalled();
            expect(mockManager.destroy).toHaveBeenCalled();
            expect(managers.values().next().value).not.toEqual(mockManager);
        });

        test('should return the existing managers if they already exist in the annotated element', () => {
            mockManager.exists.mockReturnValue(true);
            annotator.managers = new Set([mockManager]);

            const managers = annotator.getManagers(getParent(), getImage());

            expect(mockManager.exists).toHaveBeenCalled();
            expect(mockManager.destroy).not.toHaveBeenCalled();
            expect(managers.values().next().value).toEqual(mockManager);
        });
    });

    describe('getReference()', () => {
        test('should return the underlying image element', () => {
            annotator.init(1);

            expect(annotator.getReference()).toBe(container.querySelector('.image'));
        });
    });

    describe('handleStore', () => {
        test('should update the reference element with the correct class', () => {
            jest.spyOn(annotator, 'getReference').mockImplementation(getImage);

            annotator.store.dispatch(setStatusAction(CreatorStatus.init));
            expect(getImage().classList).not.toContain(CSS_IS_DRAWING_CLASS);

            annotator.store.dispatch(setStatusAction(CreatorStatus.started));
            expect(getImage().classList).toContain(CSS_IS_DRAWING_CLASS);

            annotator.store.dispatch(setStatusAction(CreatorStatus.pending));
            expect(getImage().classList).not.toContain(CSS_IS_DRAWING_CLASS);
        });
    });

    describe('init()', () => {
        beforeEach(() => {
            jest.spyOn(annotator, 'render');
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
            jest.spyOn(annotator, 'getReference').mockImplementation(getImage);
        });

        test('should initialize a manager for a new page', () => {
            annotator.init(1);
            annotator.render();

            expect(annotator.getManagers).toHaveBeenCalled();
            expect(mockManager.render).toHaveBeenCalledWith({
                intl: annotator.intl,
                store: expect.any(Object),
            });
            expect(mockManager.style).toHaveBeenCalledWith({
                height: '100px',
                left: '50px',
                top: '50px',
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
    });

    describe('scrollToAnnotation()', () => {
        beforeEach(() => {
            const payload = {
                entries: regions as Annotation[],
                limit: 1000,
                next_marker: null,
                previous_marker: null,
            };

            annotator.annotatedEl = getParent();
            annotator.store.dispatch(fetchAnnotationsAction.fulfilled(payload, 'test', undefined));
        });

        test('should call scrollToLocation for region annotations', () => {
            annotator.scrollToAnnotation('anno_1');
            expect(scrollToLocation).toHaveBeenCalledWith(getParent(), getImage(), { offsets: { x: 15, y: 15 } });
        });

        test('should do nothing if the annotation id is undefined or not available in the store', () => {
            annotator.scrollToAnnotation('nonsense');
            expect(scrollToLocation).not.toHaveBeenCalled();

            annotator.scrollToAnnotation(null);
            expect(scrollToLocation).not.toHaveBeenCalled();
        });
    });
});

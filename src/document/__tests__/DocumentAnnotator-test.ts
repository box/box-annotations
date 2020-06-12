import BaseManager from '../../common/BaseManager';
import DocumentAnnotator from '../DocumentAnnotator';
import RegionManager from '../../region/RegionManager';
import { Annotation } from '../../@types';
import { annotations as regions } from '../../region/__mocks__/data';
import { CLASS_ANNOTATIONS_LOADED } from '../../constants';
import { fetchAnnotationsAction } from '../../store';

jest.mock('../../region/RegionManager');

describe('DocumentAnnotator', () => {
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
    const getAnnotator = (options = {}): DocumentAnnotator => {
        return new DocumentAnnotator({ ...defaults, ...options });
    };
    const getPage = (pageNumber = 1): HTMLElement => {
        return container.querySelector(`[data-page-number="${pageNumber}"]`) as HTMLElement;
    };

    const payload = {
        entries: regions as Annotation[],
        limit: 1000,
        next_marker: null,
        previous_marker: null,
    };

    let annotator = getAnnotator();

    beforeEach(() => {
        container.innerHTML = `
            <div class="bp-doc">
                <div class="page" data-loaded="true" data-page-number="1" />
                <div class="page" data-loaded="true" data-page-number="2" />
                <div class="page" data-loaded="true" data-page-number="3" />
                <div class="page" data-loaded="true" />
                <div class="page" data-page-number="4" />
            </div>
        `;

        annotator = getAnnotator();
    });

    afterEach(() => {
        if (annotator) {
            annotator.destroy();
        }
    });

    describe('getPageManagers()', () => {
        test('should create new managers given a new page element', () => {
            const managers = annotator.getPageManagers(getPage());

            expect(managers.length).toBe(1);
            expect(managers[0]).toBeInstanceOf(RegionManager);
        });

        test('should destroy any existing managers if they are not present in a given page element', () => {
            const mockManager = ({ destroy: jest.fn(), exists: jest.fn(() => false) } as unknown) as RegionManager;

            annotator.managers.set(1, [mockManager]);
            annotator.getPageManagers(getPage());

            expect(mockManager.exists).toHaveBeenCalled();
            expect(mockManager.destroy).toHaveBeenCalled();
        });
    });

    describe('getPageNumber()', () => {
        test('should return the page number from the data attribute of a given page element', () => {
            expect(annotator.getPageNumber(getPage(1))).toEqual(1);
            expect(annotator.getPageNumber(getPage(2))).toEqual(2);
            expect(annotator.getPageNumber(getPage(3))).toEqual(3);
            expect(annotator.getPageNumber(getPage(4))).toEqual(4);
        });

        test('should default to page one if no page number is present', () => {
            expect(annotator.getPageNumber(document.createElement('div'))).toEqual(1);
        });
    });

    describe('getPageReference()', () => {
        const canvasLayer = document.createElement('div');
        const textLayer = document.createElement('div');

        beforeAll(() => {
            canvasLayer.classList.add('canvasWrapper');
            textLayer.classList.add('textLayer');
        });

        test('should return the text layer if available', () => {
            const pageEl = getPage();

            pageEl.appendChild(canvasLayer);
            pageEl.appendChild(textLayer);

            expect(annotator.getPageReference(pageEl)).toBe(textLayer);
        });

        test('should return the canvas layer if text layer is not available', () => {
            const pageEl = getPage();

            pageEl.appendChild(canvasLayer);

            expect(annotator.getPageReference(pageEl)).toBe(canvasLayer);
        });
    });

    describe('getPages()', () => {
        it('should return an array of all page elements', () => {
            annotator.annotatedEl = container.querySelector('.bp-doc') as HTMLElement;

            expect(annotator.getPages()).toBeInstanceOf(Array);
            expect(annotator.getPages().length).toBe(5);
        });

        it('should return an empty array if no annotated element is defined', () => {
            expect(annotator.getPages()).toEqual([]);
        });
    });

    describe('init()', () => {
        test('should set the root and annotated element based on class name', () => {
            annotator.init(5);

            expect(annotator.rootEl).toBe(container);
            expect(annotator.annotatedEl).toBe(container.querySelector('.bp-doc'));
            expect(annotator.annotatedEl!.className).toContain(CLASS_ANNOTATIONS_LOADED); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        });

        test('should emit annotations_initialized event once', () => {
            annotator.emit = jest.fn();
            annotator.store.dispatch(fetchAnnotationsAction.fulfilled(payload, 'test', undefined));

            annotator.init(1);
            annotator.init(1);
            annotator.init(1);

            expect(annotator.initialized).toEqual(true);
            expect(annotator.emit).toBeCalledWith('annotations_initialized', { annotations: regions });
            expect(annotator.emit).toBeCalledTimes(1);
        });
    });

    describe('render()', () => {
        test('should call renderPage once per valid page', () => {
            annotator.renderPage = jest.fn();
            annotator.getPages = jest.fn(() => Array.from(container.querySelectorAll('.page')));
            annotator.render();

            expect(annotator.renderPage).toHaveBeenCalledTimes(3);
        });
    });

    describe('renderPage()', () => {
        test('should initialize a manager for a new page', () => {
            const mockManager = ({ render: jest.fn() } as unknown) as BaseManager;
            const pageNumber = 1;
            const pageEl = getPage(pageNumber);

            annotator.getPageManagers = jest.fn(() => [mockManager]);
            annotator.getPageNumber = jest.fn(() => pageNumber);
            annotator.renderPage(pageEl);

            expect(annotator.getPageManagers).toHaveBeenCalledWith(pageEl);
            expect(annotator.getPageNumber).toHaveBeenCalledWith(pageEl);
            expect(mockManager.render).toHaveBeenCalledWith({
                intl: annotator.intl,
                store: expect.any(Object),
            });
        });
    });

    describe('scrollToAnnotation()', () => {
        beforeEach(() => {
            annotator.scrollToLocation = jest.fn();
            annotator.store.dispatch(fetchAnnotationsAction.fulfilled(payload, 'test', undefined));
        });

        test('should call scrollToLocation for region annotations', () => {
            annotator.scrollToAnnotation('anno_1');
            expect(annotator.scrollToLocation).toHaveBeenCalledWith(1, { x: 15, y: 15 });
        });

        test('should do nothing if the annotation id is undefined or not available in the store', () => {
            annotator.scrollToAnnotation('nonsense');
            expect(annotator.scrollToLocation).not.toHaveBeenCalled();

            annotator.scrollToAnnotation(null);
            expect(annotator.scrollToLocation).not.toHaveBeenCalled();
        });
    });

    describe('scrollToLocation', () => {
        const getPageMock = (pageNumber = 1): HTMLElement => {
            const page = document.createElement('div');

            Object.defineProperty(page, 'clientHeight', { configurable: true, value: 100 });
            Object.defineProperty(page, 'clientWidth', { configurable: true, value: 100 });
            Object.defineProperty(page, 'offsetLeft', { configurable: true, value: 0 });
            Object.defineProperty(page, 'offsetTop', { configurable: true, value: (pageNumber - 1) * 100 }); // 100 pixels per page

            return page;
        };

        beforeEach(() => {
            jest.spyOn(annotator, 'getPage').mockImplementation(getPageMock);
            jest.spyOn(container, 'scrollHeight', 'get').mockReturnValue(2000);
            jest.spyOn(container, 'scrollWidth', 'get').mockReturnValue(2000);
            jest.spyOn(container, 'scrollLeft', 'set');
            jest.spyOn(container, 'scrollTop', 'set');

            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            container.scrollTo = jest.fn((options?: ScrollToOptions) => {
                const { left, top } = options || {};

                container.scrollLeft = left || 0;
                container.scrollTop = top || 0;
            });

            annotator.annotatedEl = container;
        });

        test.each`
            page  | scrollTop
            ${1}  | ${0}
            ${2}  | ${100}
            ${20} | ${1900}
            ${30} | ${2000}
        `('should scroll the annotated element to $scrollTop for page $page', ({ page, scrollTop }) => {
            annotator.scrollToLocation(page);
            expect(annotator.annotatedEl?.scrollTop).toEqual(scrollTop);
        });

        test.each`
            page  | scrollLeft | scrollTop
            ${1}  | ${50}      | ${50}
            ${2}  | ${50}      | ${150}
            ${20} | ${50}      | ${1950}
            ${30} | ${50}      | ${2000}
        `(
            'should scroll the annotated element to $scrollLeft/$scrollTop for page $page with offsets',
            ({ page, scrollLeft, scrollTop }) => {
                annotator.scrollToLocation(page, { x: 50, y: 50 });
                expect(annotator.annotatedEl?.scrollLeft).toEqual(scrollLeft);
                expect(annotator.annotatedEl?.scrollTop).toEqual(scrollTop);
            },
        );
    });

    describe('toggleAnnotationMode()', () => {
        test('should exist', () => {
            expect(annotator.toggleAnnotationMode).toBeTruthy();
        });
    });
});

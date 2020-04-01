/* eslint-disable @typescript-eslint/camelcase */
import BaseManager from '../../common/BaseManager';
import DocumentAnnotator from '../DocumentAnnotator';
import RegionManager from '../../region/RegionManager';
import { CLASS_ANNOTATIONS_LOADED } from '../../constants';

jest.mock('../../api/FileVersionAPI', () => {
    return jest.fn().mockImplementation(() => {
        return {
            destroy: jest.fn(),
            fetchAnnotations: jest.fn((): Promise<void> => new Promise(jest.fn())),
        };
    });
});
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
                can_annotate: true,
                can_view_annotations_all: true,
                can_view_annotations_self: true,
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
    const getPage = (pageNumber: number | string = 1): HTMLElement => {
        return container.querySelector(`[data-page-number="${pageNumber}"]`) as HTMLElement;
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

    describe('destroy()', () => {
        test('should destroy the api instance', () => {
            annotator.destroy();

            expect(annotator.api.destroy).toBeCalled();
        });
    });

    describe('getPageManagers()', () => {
        test('should create new managers given a new page element', () => {
            const managers = annotator.getPageManagers(getPage());

            expect(managers.length).toBe(1);
            expect(managers[0]).toBeInstanceOf(RegionManager);
        });

        test('should destroy any existing managers if they are not present in a given page element', () => {
            const mockManager = ({ destroy: jest.fn(), exists: jest.fn(() => false) } as unknown) as RegionManager;

            annotator.managers.set('1', [mockManager]);
            annotator.getPageManagers(getPage());

            expect(mockManager.exists).toHaveBeenCalled();
            expect(mockManager.destroy).toHaveBeenCalled();
        });
    });

    describe('getPageNumber()', () => {
        test('should return the page number from the data attribute of a given page element', () => {
            expect(annotator.getPageNumber(getPage(1))).toEqual('1');
            expect(annotator.getPageNumber(getPage(2))).toEqual('2');
            expect(annotator.getPageNumber(getPage(3))).toEqual('3');
            expect(annotator.getPageNumber(getPage(4))).toEqual('4');
        });

        test('should default to page one if no page number is present', () => {
            expect(annotator.getPageNumber(document.createElement('div'))).toEqual('1');
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
            const pageNumber = '1';
            const pageEl = getPage(pageNumber);

            annotator.annotations = { [pageNumber]: [] };
            annotator.getPageManagers = jest.fn(() => [mockManager]);
            annotator.getPageNumber = jest.fn(() => pageNumber);
            annotator.renderPage(pageEl);

            expect(annotator.getPageManagers).toHaveBeenCalledWith(pageEl);
            expect(annotator.getPageNumber).toHaveBeenCalledWith(pageEl);
            expect(mockManager.render).toHaveBeenCalledWith({
                annotations: [],
                intl: annotator.intl,
                scale: 1,
            });
        });
    });

    describe('scrollToAnnotation()', () => {
        test('should exist', () => {
            expect(annotator.scrollToAnnotation).toBeTruthy();
        });
    });

    describe('toggleAnnotationMode()', () => {
        test('should exist', () => {
            expect(annotator.toggleAnnotationMode).toBeTruthy();
        });
    });
});

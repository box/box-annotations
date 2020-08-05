import BaseManager from '../../common/BaseManager';
import DocumentAnnotator from '../DocumentAnnotator';
import RegionManager from '../../region/RegionManager';
import { Annotation, Event } from '../../@types';
import { annotations as regions } from '../../region/__mocks__/data';
import { fetchAnnotationsAction } from '../../store';
import { HighlightManager } from '../../highlight';
import { scrollToLocation } from '../../utils/scroll';

jest.mock('../../highlight/HighlightManager');
jest.mock('../../region/RegionManager');
jest.mock('../../utils/scroll');

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
        container.classList.add('bp');
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

    describe('event handlers', () => {
        beforeEach(() => {
            annotator.annotatedEl = container.querySelector('.bp-doc') as HTMLElement;

            jest.spyOn(annotator.annotatedEl.classList, 'add');
            jest.spyOn(annotator.annotatedEl.classList, 'remove');
        });

        test('should add/remove highlight class', () => {
            annotator.emit(Event.ANNOTATIONS_MODE_CHANGE, { mode: 'highlight' });
            expect(annotator.annotatedEl?.classList.add).toHaveBeenCalledWith('ba-is-highlighting');

            annotator.emit(Event.ANNOTATIONS_MODE_CHANGE, { mode: 'region' });
            expect(annotator.annotatedEl?.classList.remove).toHaveBeenCalledWith('ba-is-highlighting');
        });
    });

    describe('getPageManagers()', () => {
        test('should create new managers given a new page element', () => {
            const managers = annotator.getPageManagers(getPage());
            const managerIterator = managers.values();

            expect(managers.size).toBe(2);
            expect(managerIterator.next().value).toBeInstanceOf(HighlightManager);
            expect(managerIterator.next().value).toBeInstanceOf(RegionManager);
        });

        test('should destroy any existing managers if they are not present in a given page element', () => {
            const mockManager = ({ destroy: jest.fn(), exists: jest.fn(() => false) } as unknown) as RegionManager;

            annotator.managers.set(1, new Set([mockManager]));
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

            expect(annotator.containerEl).toBe(container);
            expect(annotator.annotatedEl).toBe(container.querySelector('.bp-doc'));
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

            annotator.getPageManagers = jest.fn(() => new Set([mockManager]));
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
            annotator.annotatedEl = container.querySelector('.bp-doc') as HTMLElement;
            annotator.store.dispatch(fetchAnnotationsAction.fulfilled(payload, 'test', undefined));
        });

        test('should call scrollToLocation for region annotations', () => {
            const parentEl = annotator.annotatedEl as HTMLElement;
            const referenceEl = parentEl.querySelector('[data-page-number="1"]');

            annotator.scrollToAnnotation('anno_1');
            expect(scrollToLocation).toHaveBeenCalledWith(parentEl, referenceEl, { offsets: { x: 15, y: 15 } });
        });

        test('should do nothing if the annotation id is undefined or not available in the store', () => {
            annotator.scrollToAnnotation('nonsense');
            expect(scrollToLocation).not.toHaveBeenCalled();

            annotator.scrollToAnnotation(null);
            expect(scrollToLocation).not.toHaveBeenCalled();
        });
    });
});

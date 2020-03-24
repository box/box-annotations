/* eslint-disable @typescript-eslint/camelcase */
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
        intl: {},
        locale: 'en-US',
        token: '1234567890',
    };
    const getAnnotator = (options = {}): DocumentAnnotator => new DocumentAnnotator({ ...defaults, ...options });
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
        it('should destroy the api instance', () => {
            annotator.destroy();

            expect(annotator.api.destroy).toBeCalled();
        });
    });

    describe('init()', () => {
        it('should set the root and annotated element based on class name', () => {
            annotator.init(5);

            expect(annotator.rootEl).toBe(container);
            expect(annotator.annotatedEl).toBe(container.querySelector('.bp-doc'));
            expect(annotator.annotatedEl!.className).toContain(CLASS_ANNOTATIONS_LOADED); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        });
    });

    describe('handleScale', () => {
        it('should call init with the new scale', () => {
            annotator.init = jest.fn();
            annotator.handleScale({ scale: 5 });

            expect(annotator.init).toHaveBeenCalledWith(5);
        });
    });

    describe('render()', () => {
        it('should call renderPage once per valid page', () => {
            annotator.renderPage = jest.fn();
            annotator.getPages = jest.fn(() => Array.from(container.querySelectorAll('.page')));
            annotator.render();

            expect(annotator.renderPage).toHaveBeenCalledTimes(3);
        });
    });

    describe('renderPage()', () => {
        it('should initialize a manager for a new page', () => {
            const pageEl = container.querySelector('.page') as HTMLElement;
            const pageNumber = '1';

            annotator.renderPage(pageEl);

            const managers = annotator.managers.get(pageNumber);

            expect(managers && managers.length).toBe(1);
            expect(managers && managers[0]).toBeInstanceOf(RegionManager);
        });
    });

    describe('scrollToAnnotation()', () => {
        it('should exist', () => {
            expect(annotator.scrollToAnnotation).toBeTruthy();
        });
    });

    describe('toggleAnnotationMode()', () => {
        it('should exist', () => {
            expect(annotator.toggleAnnotationMode).toBeTruthy();
        });
    });
});

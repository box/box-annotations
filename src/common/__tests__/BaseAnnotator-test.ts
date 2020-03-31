/* eslint-disable @typescript-eslint/camelcase */
import { ANNOTATOR_EVENT } from '../../constants';
import BaseAnnotator from '../BaseAnnotator';

jest.mock('../../api/FileVersionAPI');

describe('BaseAnnotator', () => {
    const defaults = {
        apiHost: 'https://api.box.com',
        container: document.createElement('div'),
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
    const getAnnotator = (options = {}): BaseAnnotator => new BaseAnnotator({ ...defaults, ...options });
    let annotator = getAnnotator();

    beforeEach(() => {
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

        test('should remove the base class name from the root element', () => {
            const rootEl = document.createElement('div');
            rootEl.classList.add('ba');

            annotator.rootEl = rootEl;
            annotator.destroy();

            expect(annotator.rootEl.classList).not.toContain('ba');
        });
    });

    describe('handleScale', () => {
        test('should call init with the new scale', () => {
            annotator.init = jest.fn();
            annotator.handleScale({ scale: 5 });

            expect(annotator.init).toHaveBeenCalledWith(5);
        });
    });

    describe('init()', () => {
        test('should set the root element based on class selector', () => {
            annotator.init(5);

            expect(annotator.rootEl).toBe(defaults.container);
            expect(annotator.rootEl && annotator.rootEl.classList).toContain('ba');
        });

        test('should emit error if no root element exists', () => {
            annotator = getAnnotator({ container: 'non-existent' });
            annotator.emit = jest.fn();
            annotator.init(5);

            expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, expect.any(String));
            expect(annotator.rootEl).toBeNull();
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

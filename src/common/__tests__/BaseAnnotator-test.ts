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
        it('should destroy the api instance', () => {
            annotator.destroy();

            expect(annotator.api.destroy).toBeCalled();
        });
    });

    describe('handleScale', () => {
        it('should call init with the new scale', () => {
            annotator.init = jest.fn();
            annotator.handleScale({ scale: 5 });

            expect(annotator.init).toHaveBeenCalledWith(5);
        });
    });

    describe('init()', () => {
        it('should set the root element based on class selector', () => {
            annotator.init(5);

            expect(annotator.rootEl).toBe(defaults.container);
        });

        it('should emit error if no root element exists', () => {
            annotator = getAnnotator({ container: 'non-existent' });
            annotator.emit = jest.fn();
            annotator.init(5);

            expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, expect.any(String));
            expect(annotator.rootEl).toBeNull();
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

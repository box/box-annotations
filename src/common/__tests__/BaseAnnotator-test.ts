import * as store from '../../store';
import BaseAnnotator from '../BaseAnnotator';
import { ANNOTATOR_EVENT } from '../../constants';
import { Event, LegacyEvent } from '../../@types';
import { Mode } from '../../store/common';
import APIFactory from '../../api';

jest.mock('../EventEmitter');
jest.mock('../../api');
jest.mock('../../store', () => ({
    createStore: jest.fn(() => ({ dispatch: jest.fn() })),
    removeAnnotationAction: jest.fn(),
    fetchAnnotationsAction: jest.fn(),
    fetchCollaboratorsAction: jest.fn(),
    setActiveAnnotationIdAction: jest.fn(),
    setVisibilityAction: jest.fn(),
    toggleAnnotationModeAction: jest.fn(),
}));

describe('BaseAnnotator', () => {
    const defaults = {
        apiHost: 'https://api.box.com',
        container: document.createElement('div'),
        file: {
            id: '12345',
            file_version: { id: '98765' },
            permissions: {
                can_annotate: true,
                can_create_annotations: true,
                can_view_annotations: true,
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

    describe('constructor()', () => {
        test.each`
            optionsFileId | expectedActiveId
            ${'12345'}    | ${'123'}
            ${'987'}      | ${null}
        `(
            'should parse fileOptions for initial activeId and set it to $expectedActiveId',
            ({ optionsFileId, expectedActiveId }) => {
                const fileOptions = {
                    [optionsFileId]: {
                        annotations: { activeId: '123' },
                    },
                };
                annotator = getAnnotator({ fileOptions });

                expect(store.createStore).toHaveBeenLastCalledWith(
                    {
                        annotations: { activeId: expectedActiveId },
                        options: {
                            fileId: '12345',
                            fileVersionId: '98765',
                            permissions: {
                                can_annotate: true,
                                can_create_annotations: true,
                                can_view_annotations: true,
                                can_view_annotations_all: true,
                                can_view_annotations_self: true,
                            },
                        },
                    },
                    { api: expect.any(APIFactory) },
                );
            },
        );
    });

    describe('destroy()', () => {
        test('should remove the base class name from the root element', () => {
            const rootEl = document.createElement('div');
            rootEl.classList.add('ba');

            annotator.rootEl = rootEl;
            annotator.destroy();

            expect(annotator.rootEl.classList).not.toContain('ba');
        });

        test('should remove proper event handlers', () => {
            annotator.removeListener = jest.fn();

            annotator.destroy();

            expect(annotator.removeListener).toBeCalledWith(Event.ACTIVE_SET, expect.any(Function));
            expect(annotator.removeListener).toBeCalledWith(Event.ANNOTATION_REMOVE, expect.any(Function));
            expect(annotator.removeListener).toBeCalledWith(Event.VISIBLE_SET, expect.any(Function));
            expect(annotator.removeListener).toBeCalledWith(LegacyEvent.SCALE, expect.any(Function));
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

    describe('setVisibility()', () => {
        test.each([true, false])('should hide/show annotations if visibility is %p', visibility => {
            annotator.rootEl = defaults.container;
            annotator.setVisibility(visibility);
            expect(annotator.rootEl.classList.contains('is-hidden')).toEqual(!visibility);
        });
    });

    describe('setActiveAnnotationId()', () => {
        test.each([null, '12345'])('should dispatch setActiveAnnotationIdAction with id %s', id => {
            annotator.setActiveId(id);
            expect(annotator.store.dispatch).toBeCalled();
            expect(store.setActiveAnnotationIdAction).toBeCalledWith(id);
        });
    });

    describe('removeAnnotation', () => {
        test('should dispatch deleteActiveAnnotationAction', () => {
            const id = '123';
            annotator.removeAnnotation(id);

            expect(annotator.store.dispatch).toBeCalled();
            expect(store.removeAnnotationAction).toBeCalledWith(id);
        });
    });

    describe('toggleAnnotationMode()', () => {
        test('should dispatch toggleAnnotationModeAction with specified mode', () => {
            annotator.toggleAnnotationMode('region' as Mode);

            expect(annotator.store.dispatch).toBeCalled();
            expect(store.toggleAnnotationModeAction).toBeCalledWith('region');
        });
    });
});

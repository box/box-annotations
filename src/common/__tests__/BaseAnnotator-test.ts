import noop from 'lodash/noop';
import * as store from '../../store';
import BaseAnnotator from '../BaseAnnotator';
import eventManager from '../EventManager';
import { ANNOTATOR_EVENT } from '../../constants';
import { Event, LegacyEvent } from '../../@types';
import { Mode } from '../../store/common';
import APIFactory from '../../api';

jest.mock('../EventManager');
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

            expect(annotator.removeListener).toBeCalledWith(Event.ACTIVE_SET, annotator.setActiveAnnotationId);
            expect(annotator.removeListener).toBeCalledWith(Event.ANNOTATION_REMOVE, annotator.removeAnnotation);
            expect(annotator.removeListener).toBeCalledWith(Event.VISIBLE_SET, annotator.setVisibility);
            expect(annotator.removeListener).toBeCalledWith(LegacyEvent.SCALE, annotator.handleScale);
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
        test('should dispatch toggleAnnotationModeAction with specified mode', () => {
            annotator.toggleAnnotationMode('region' as Mode);

            expect(annotator.store.dispatch).toBeCalled();
            expect(store.toggleAnnotationModeAction).toBeCalledWith('region');
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
        test.each(['none', 'region'])('should dispatch setActiveAnnotationIdAction with mode %s', mode => {
            annotator.setActiveAnnotationId(mode);
            expect(annotator.store.dispatch).toBeCalled();
            expect(store.setActiveAnnotationIdAction).toBeCalledWith(mode);
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

    describe('eventing', () => {
        describe('addListener()', () => {
            test('should proxy addListener to eventManager', () => {
                annotator.addListener('foo', noop);
                expect(eventManager.addListener).toHaveBeenCalledWith('foo', noop);
            });
        });

        describe('removeAllListeners()', () => {
            test('should proxy removeAllListeners to eventManager', () => {
                annotator.removeAllListeners();
                expect(eventManager.removeAllListeners).toHaveBeenCalled();
            });
        });

        describe('removeListener()', () => {
            test('should proxy removeListener to eventManager', () => {
                annotator.removeListener('foo', noop);
                expect(eventManager.removeListener).toHaveBeenCalledWith('foo', noop);
            });
        });

        describe('emit()', () => {
            test('should proxy emit to eventManager', () => {
                const data = { hello: 'world' };
                annotator.emit('foo', data);
                expect(eventManager.emit).toHaveBeenCalledWith('foo', data);
            });
        });
    });
});

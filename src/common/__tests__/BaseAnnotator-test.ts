import * as store from '../../store';
import APIFactory from '../../api';
import BaseAnnotator, { ANNOTATION_CLASSES, CSS_CONTAINER_CLASS, CSS_LOADED_CLASS } from '../BaseAnnotator';
import { ANNOTATOR_EVENT } from '../../constants';
import { Event, LegacyEvent } from '../../@types';
import { Mode } from '../../store/common';
import { setIsInitialized } from '../../store';

jest.mock('../../api');
jest.mock('../../store/createStore');

class MockAnnotator extends BaseAnnotator {
    protected getAnnotatedElement(): HTMLElement | null | undefined {
        return this.containerEl?.querySelector('.inner');
    }
}

describe('BaseAnnotator', () => {
    const container = document.createElement('div');
    container.innerHTML = `<div class="inner" />`;

    const features = { enabledFeature: true };
    const defaults = {
        apiHost: 'https://api.box.com',
        container,
        features,
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
    const getAnnotator = (options = {}): MockAnnotator => new MockAnnotator({ ...defaults, ...options });
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
                        common: { mode: 'none' },
                        options: {
                            fileId: '12345',
                            fileVersionId: '98765',
                            isCurrentFileVersion: true,
                            permissions: {
                                can_create_annotations: true,
                                can_view_annotations: true,
                            },
                        },
                    },
                    { api: expect.any(APIFactory) },
                );
            },
        );

        test('should set annotator fileVersionId based on fileOptions first', () => {
            const fileOptions = {
                '12345': {
                    fileVersionId: '456',
                },
            };

            annotator = getAnnotator({ fileOptions });

            expect(store.createStore).toHaveBeenLastCalledWith(
                {
                    annotations: { activeId: null },
                    common: { mode: 'none' },
                    options: {
                        fileId: '12345',
                        fileVersionId: '456',
                        isCurrentFileVersion: false,
                        permissions: {
                            can_create_annotations: true,
                            can_view_annotations: true,
                        },
                    },
                },
                { api: expect.any(APIFactory) },
            );
        });

        test.each`
            fileOptionsVersionId | currentFileVersionId | isCurrentFileVersion
            ${'0'}               | ${'0'}               | ${true}
            ${undefined}         | ${'0'}               | ${true}
            ${'1'}               | ${'0'}               | ${false}
        `(
            'should set isCurrentFileVersion to $isCurrentFileVersion',
            ({ currentFileVersionId, fileOptionsVersionId, isCurrentFileVersion }) => {
                const file = {
                    ...defaults.file,
                    file_version: { id: fileOptionsVersionId },
                };
                const fileOptions = {
                    '12345': {
                        currentFileVersionId,
                        fileVersionId: fileOptionsVersionId,
                    },
                };

                annotator = getAnnotator({ file, fileOptions });

                expect(store.createStore).toHaveBeenLastCalledWith(
                    expect.objectContaining({ options: expect.objectContaining({ isCurrentFileVersion }) }),
                    expect.any(Object),
                );
            },
        );

        test('should set features option', () => {
            annotator = getAnnotator({ features });

            expect(annotator.features).toEqual(features);
        });

        test('should set initial mode', () => {
            annotator = getAnnotator({ initialMode: 'region' });

            expect(store.createStore).toHaveBeenLastCalledWith(
                expect.objectContaining({ common: { mode: 'region' } }),
                expect.any(Object),
            );
        });
    });

    describe('destroy()', () => {
        test('should remove the base class name from the root element', () => {
            const containerEl = document.createElement('div');
            containerEl.classList.add(CSS_CONTAINER_CLASS);

            annotator.containerEl = containerEl;
            annotator.destroy();

            expect(annotator.containerEl.classList).not.toContain(CSS_CONTAINER_CLASS);
        });

        test('should remove all annotation classes from annotation layer', () => {
            const annotatedEl = document.createElement('div');
            annotatedEl.classList.add(CSS_LOADED_CLASS);

            annotator.annotatedEl = annotatedEl;
            annotator.destroy();

            expect(annotator.annotatedEl.classList).not.toContain(CSS_LOADED_CLASS);
            expect(annotator.annotatedEl.classList).not.toContain(ANNOTATION_CLASSES[Mode.HIGHLIGHT]);
            expect(annotator.annotatedEl.classList).not.toContain(ANNOTATION_CLASSES[Mode.REGION]);
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
        test('should set its reference elements based on class selector', () => {
            annotator.init(5);

            expect(annotator.containerEl).toBeDefined();
            expect(annotator.containerEl?.classList).toContain(CSS_CONTAINER_CLASS);
            expect(annotator.annotatedEl?.classList).toContain(CSS_LOADED_CLASS);
        });

        test('should dispatch all necessary actions', () => {
            annotator.init(1, 180);

            expect(annotator.store.dispatch).toHaveBeenCalledWith(store.setRotationAction(180));
            expect(annotator.store.dispatch).toHaveBeenCalledWith(store.setScaleAction(1));
            expect(annotator.store.dispatch).toHaveBeenCalledWith(setIsInitialized());
        });

        test('should emit error if no root element exists', () => {
            annotator = getAnnotator({ container: 'non-existent' });
            annotator.emit = jest.fn();
            annotator.init(5);

            expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, expect.any(String));
            expect(annotator.containerEl).toBeNull();
        });
    });

    describe('event handlers', () => {
        beforeEach(() => {
            jest.spyOn(annotator, 'init');
            jest.spyOn(annotator, 'removeAnnotation');
            jest.spyOn(annotator, 'setActiveId');
            jest.spyOn(annotator, 'setVisibility');
        });

        test('should call their underlying methods', () => {
            annotator.emit(LegacyEvent.SCALE, { rotationAngle: 0, scale: 1 });
            expect(annotator.init).toHaveBeenCalledWith(1, 0);

            annotator.emit(Event.ACTIVE_SET, 12345);
            expect(annotator.setActiveId).toHaveBeenCalledWith(12345);

            annotator.emit(Event.ANNOTATION_REMOVE, 12345);
            expect(annotator.removeAnnotation).toHaveBeenCalledWith(12345);

            annotator.emit(Event.VISIBLE_SET, true);
            expect(annotator.setVisibility).toHaveBeenCalledWith(true);
        });
    });

    describe('scrollToAnnotation()', () => {
        test('should exist', () => {
            expect(annotator.scrollToAnnotation).toBeTruthy();
        });
    });

    describe('setVisibility()', () => {
        test.each([true, false])('should hide/show annotations if visibility is %p', visibility => {
            annotator.init(1);
            annotator.setVisibility(visibility);
            expect(annotator.containerEl?.classList.contains('is-hidden')).toEqual(!visibility);
        });

        test('should do nothing if the root element is not defined', () => {
            annotator.containerEl = document.querySelector('nonsense') as HTMLElement;
            annotator.setVisibility(true);
            expect(annotator.containerEl?.classList).toBeFalsy();
        });
    });

    describe('setActiveAnnotationId()', () => {
        test.each([null, '12345'])('should dispatch setActiveAnnotationIdAction with id %s', id => {
            annotator.setActiveId(id);
            expect(annotator.store.dispatch).toBeCalledWith(store.setActiveAnnotationIdAction(id));
        });
    });

    describe('removeAnnotation', () => {
        test('should dispatch removeActiveAnnotationAction with the specified id', () => {
            const id = '123';
            annotator.removeAnnotation(id);
            expect(annotator.store.dispatch).toBeCalledWith(store.removeAnnotationAction(id));
        });
    });

    describe('toggleAnnotationMode()', () => {
        test('should dispatch toggleAnnotationModeAction with specified mode', () => {
            annotator.toggleAnnotationMode('region' as Mode);
            expect(annotator.store.dispatch).toBeCalledWith(store.toggleAnnotationModeAction('region' as Mode));
        });
    });

    describe('isFeatureEnabled()', () => {
        test('should return whether feature is enabled or not', () => {
            expect(annotator.isFeatureEnabled('enabledFeature')).toBe(true);
            expect(annotator.isFeatureEnabled('notEnabledFeature')).toBe(false);
        });
    });
});

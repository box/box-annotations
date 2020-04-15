/* eslint-disable @typescript-eslint/camelcase */
import noop from 'lodash/noop';
import { ANNOTATOR_EVENT } from '../../constants';
import BaseAnnotator from '../BaseAnnotator';
import eventManager from '../EventManager';
import { Mode, setActiveAnnotationIdAction, setVisibilityAction, toggleAnnotationModeAction } from '../../store';

jest.mock('../EventManager');
jest.mock('../../api/FileVersionAPI');
jest.mock('../../store', () => ({
    createStore: jest.fn(() => ({ dispatch: jest.fn() })),
    toggleAnnotationModeAction: jest.fn(),
    setActiveAnnotationIdAction: jest.fn(),
    setVisibilityAction: jest.fn(),
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
        test('should dispatch toggleAnnotationModeAction with specified mode', () => {
            annotator.toggleAnnotationMode('region' as Mode);

            expect(annotator.store.dispatch).toBeCalled();
            expect(toggleAnnotationModeAction).toBeCalledWith('region');
        });
    });

    describe('setVisibility()', () => {
        test.each([true, false])('should dispatch setVisibilityAction with visibility %p', visibility => {
            annotator.setVisibility(visibility);
            expect(annotator.store.dispatch).toBeCalled();
            expect(setVisibilityAction).toBeCalledWith(visibility);
        });
    });

    describe('setActiveAnnotationId()', () => {
        test.each(['none', 'region'])('should dispatch setActiveAnnotationIdAction with mode %s', mode => {
            annotator.setActiveAnnotationId(mode);
            expect(annotator.store.dispatch).toBeCalled();
            expect(setActiveAnnotationIdAction).toBeCalledWith(mode);
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

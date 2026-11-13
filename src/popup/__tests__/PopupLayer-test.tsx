import React from 'react';
import { render, screen, act } from '@testing-library/react';
import PopupLayer, { Props } from '../PopupLayer';
import { pathGroups } from '../../drawing/__mocks__/drawingData';
import { CreatorStatus, CreatorItemHighlight, CreatorItemRegion, Mode, CreatorItemDrawing } from '../../store';
import { Rect } from '../../@types';
import { TARGET_TYPE } from '../../constants';

let mockOnCancel: ((text?: string) => void) | undefined;
let mockOnSubmit: ((text: string) => void) | undefined;

jest.mock('../../components/Popups/PopupV2', () => {
    const ReactMock = jest.requireActual('react');
    return (props: Record<string, unknown>) => {
        mockOnCancel = props.onCancel as typeof mockOnCancel;
        mockOnSubmit = props.onSubmit as typeof mockOnSubmit;
        return ReactMock.createElement('div', {
            'data-testid': 'popup-v2',
            'data-annotation-id': props.annotationId || '',
        });
    };
});

describe('PopupLayer', () => {
    const getRect = (): Rect => ({
        type: 'rect',
        height: 50,
        width: 50,
        x: 10,
        y: 10,
    });
    const getStagedDrawing = (): CreatorItemDrawing => ({
        location: 1,
        pathGroups,
    });
    const getStagedHighlight = (): CreatorItemHighlight => ({
        location: 1,
        shapes: [getRect()],
    });
    const getStagedRegion = (): CreatorItemRegion => ({
        location: 1,
        shape: getRect(),
    });

    const referenceId = '123';
    const popupPortalEl = document.createElement('div');
    const getDefaults = (): Props => ({
        activeAnnotationId: null,
        createDrawing: jest.fn(),
        createHighlight: jest.fn(),
        createRegion: jest.fn(),
        isPromoting: false,
        location: 1,
        message: '',
        mode: Mode.HIGHLIGHT,
        popupPortalEl,
        referenceId: '123',
        resetCreator: jest.fn(),
        setMessage: jest.fn(),
        staged: getStagedHighlight(),
        status: CreatorStatus.staged,
        targetType: TARGET_TYPE.PAGE,
    });

    beforeEach(() => {
        document.body.innerHTML = `<div data-ba-reference-id="${referenceId}"></div>`;
        document.body.appendChild(popupPortalEl);
        mockOnCancel = undefined;
        mockOnSubmit = undefined;
    });

    const renderLayer = (props = {}): ReturnType<typeof render> => {
        let result: ReturnType<typeof render>;
        act(() => {
            result = render(<PopupLayer {...getDefaults()} {...props} />);
        });
        return result!;
    };

    describe('render()', () => {
        test.each`
            status                    | showPopup
            ${CreatorStatus.init}     | ${false}
            ${CreatorStatus.pending}  | ${true}
            ${CreatorStatus.rejected} | ${true}
            ${CreatorStatus.staged}   | ${true}
        `('should render PopupV2 ($showPopup) if the creator status is $status', ({ status, showPopup }) => {
            renderLayer({ status });

            if (showPopup) {
                expect(screen.getByTestId('popup-v2')).toBeDefined();
            } else {
                expect(screen.queryByTestId('popup-v2')).toBeNull();
            }
        });

        test('should not render PopupV2 if there is a staged type and mode mismatch', () => {
            renderLayer({ mode: Mode.REGION });

            expect(screen.queryByTestId('popup-v2')).toBeNull();
        });

        test('should render PopupV2 if promoting a highlight and staged exists', () => {
            renderLayer({ mode: Mode.NONE, isPromoting: true });
            expect(screen.getByTestId('popup-v2')).toBeDefined();
        });

        test('should not render PopupV2 if promoting a highlight but staged does not exist', () => {
            renderLayer({ mode: Mode.NONE, isPromoting: true, staged: null });
            expect(screen.queryByTestId('popup-v2')).toBeNull();
        });

        test('should render PopupV2 if it is a staged drawing', () => {
            renderLayer({ mode: Mode.DRAWING, staged: getStagedDrawing() });
            expect(screen.getByTestId('popup-v2')).toBeDefined();
        });

        describe('active annotation thread', () => {
            const activeAnnotationId = 'annotation-1';

            const appendTarget = (id: string): HTMLElement => {
                const target = document.createElement('div');
                target.setAttribute('data-ba-annotation-id', id);
                document.body.appendChild(target);
                return target;
            };

            test('should register a MutationObserver and resolve once the target element appears in the DOM', async () => {
                const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');
                const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');

                renderLayer({
                    activeAnnotationId,
                    staged: null,
                    status: CreatorStatus.init,
                });

                expect(screen.queryByTestId('popup-v2')).toBeNull();
                expect(observeSpy).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });

                act(() => {
                    appendTarget(activeAnnotationId);
                });

                const popup = await screen.findByTestId('popup-v2');
                expect(popup.getAttribute('data-annotation-id')).toBe(activeAnnotationId);
                expect(disconnectSpy).toHaveBeenCalled();

                observeSpy.mockRestore();
                disconnectSpy.mockRestore();
            });

            test('should disconnect the previous observer when activeAnnotationId changes', () => {
                const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');

                const { rerender } = renderLayer({
                    activeAnnotationId,
                    staged: null,
                    status: CreatorStatus.init,
                });

                const callsBeforeChange = disconnectSpy.mock.calls.length;

                act(() => {
                    rerender(
                        <PopupLayer
                            {...getDefaults()}
                            activeAnnotationId="annotation-2"
                            staged={null}
                            status={CreatorStatus.init}
                        />,
                    );
                });

                expect(disconnectSpy.mock.calls.length).toBeGreaterThan(callsBeforeChange);

                disconnectSpy.mockRestore();
            });

            test('should disconnect the observer on unmount', () => {
                const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');

                const { unmount } = renderLayer({
                    activeAnnotationId,
                    staged: null,
                    status: CreatorStatus.init,
                });

                const callsBeforeUnmount = disconnectSpy.mock.calls.length;
                act(() => {
                    unmount();
                });

                expect(disconnectSpy.mock.calls.length).toBeGreaterThan(callsBeforeUnmount);

                disconnectSpy.mockRestore();
            });

            test('should not update reference when target appears after unmount', () => {
                const { unmount } = renderLayer({
                    activeAnnotationId,
                    staged: null,
                    status: CreatorStatus.init,
                });

                act(() => {
                    unmount();
                });

                expect(() => {
                    act(() => {
                        appendTarget(activeAnnotationId);
                    });
                }).not.toThrow();
            });

            test('should disconnect the observer after the timeout when no target appears', () => {
                jest.useFakeTimers();
                const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');

                renderLayer({
                    activeAnnotationId,
                    staged: null,
                    status: CreatorStatus.init,
                });

                const callsBeforeTimeout = disconnectSpy.mock.calls.length;

                act(() => {
                    jest.advanceTimersByTime(10000);
                });

                expect(disconnectSpy.mock.calls.length).toBeGreaterThan(callsBeforeTimeout);

                disconnectSpy.mockRestore();
                jest.useRealTimers();
            });
        });
    });

    describe('event handlers', () => {
        describe('handleCancel()', () => {
            test('should reset creator', () => {
                const resetCreator = jest.fn();
                renderLayer({ resetCreator });
                mockOnCancel!();

                expect(resetCreator).toHaveBeenCalled();
            });
        });

        describe('handleSubmit', () => {
            test('should create highlight if staged item is type highlight', () => {
                const createDrawing = jest.fn();
                const createHighlight = jest.fn();
                const createRegion = jest.fn();
                const message = 'foo';
                renderLayer({ createHighlight, createRegion, message });
                mockOnSubmit!(message);

                expect(createDrawing).not.toHaveBeenCalled();
                expect(createHighlight).toHaveBeenCalledWith({
                    ...getStagedHighlight(),
                    message,
                    targetType: 'page',
                });
                expect(createRegion).not.toHaveBeenCalled();
            });

            test('should create region if staged item is type region', () => {
                const createDrawing = jest.fn();
                const createHighlight = jest.fn();
                const createRegion = jest.fn();
                const message = 'foo';
                renderLayer({
                    createHighlight,
                    createRegion,
                    message,
                    mode: Mode.REGION,
                    staged: getStagedRegion(),
                });
                mockOnSubmit!(message);

                expect(createDrawing).not.toHaveBeenCalled();
                expect(createHighlight).not.toHaveBeenCalled();
                expect(createRegion).toHaveBeenCalledWith({
                    ...getStagedRegion(),
                    message,
                    targetType: 'page',
                });
            });

            test('should create drawing if staged item is type drawing', () => {
                const createDrawing = jest.fn();
                const createHighlight = jest.fn();
                const createRegion = jest.fn();
                const message = 'foo';
                renderLayer({
                    createDrawing,
                    createHighlight,
                    createRegion,
                    message,
                    mode: Mode.DRAWING,
                    staged: getStagedDrawing(),
                    targetType: 'frame',
                });
                mockOnSubmit!(message);

                expect(createDrawing).toHaveBeenCalledWith({
                    ...getStagedDrawing(),
                    message,
                    targetType: 'frame',
                });
                expect(createHighlight).not.toHaveBeenCalled();
                expect(createRegion).not.toHaveBeenCalled();
            });
        });
    });
});

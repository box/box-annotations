import React from 'react';
import { render, screen, act } from '@testing-library/react';
import PopupLayer, { Props } from '../PopupLayer';
import { pathGroups } from '../../drawing/__mocks__/drawingData';
import { CreatorStatus, CreatorItemHighlight, CreatorItemRegion, Mode, CreatorItemDrawing } from '../../store';
import { Rect } from '../../@types';
import { TARGET_TYPE } from '../../constants';

let mockOnCancel: ((text?: string) => void) | undefined;
let mockOnChange: ((text?: string) => void) | undefined;
let mockOnSubmit: ((text: string) => void) | undefined;

jest.mock('../../components/Popups/PopupThreadV2', () => {
    const ReactMock = jest.requireActual('react');
    return (props: Record<string, unknown>) =>
        ReactMock.createElement('div', {
            'data-testid': 'popup-thread-v2',
            'data-annotation-id': props.annotationId,
        });
});

jest.mock('../../components/Popups/PopupReply', () => {
    const ReactMock = jest.requireActual('react');
    return (props: Record<string, unknown>) => {
        mockOnCancel = props.onCancel as typeof mockOnCancel;
        mockOnChange = props.onChange as typeof mockOnChange;
        mockOnSubmit = props.onSubmit as typeof mockOnSubmit;
        return ReactMock.createElement('div', {
            'data-testid': 'popup-reply',
            'data-is-pending': String(props.isPending),
            'data-is-threaded': String(props.isThreadedAnnotation),
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
    const getDefaults = (): Props => ({
        activeAnnotationId: null,
        createDrawing: jest.fn(),
        createHighlight: jest.fn(),
        createRegion: jest.fn(),
        isPromoting: false,
        location: 1,
        message: '',
        mode: Mode.HIGHLIGHT,
        referenceId: '123',
        resetCreator: jest.fn(),
        setMessage: jest.fn(),
        staged: getStagedHighlight(),
        status: CreatorStatus.staged,
        targetType: TARGET_TYPE.PAGE,
    });

    beforeEach(() => {
        document.body.innerHTML = `<div data-ba-reference-id="${referenceId}"></div>`;
        mockOnCancel = undefined;
        mockOnChange = undefined;
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
            status                    | showReply
            ${CreatorStatus.init}     | ${false}
            ${CreatorStatus.pending}  | ${true}
            ${CreatorStatus.rejected} | ${true}
            ${CreatorStatus.staged}   | ${true}
        `('should render a reply popup ($showReply) if the creator status is $status', ({ status, showReply }) => {
            renderLayer({ status });

            if (showReply) {
                expect(screen.getByTestId('popup-reply')).toBeDefined();
            } else {
                expect(screen.queryByTestId('popup-reply')).toBeNull();
            }
        });

        test.each`
            status                    | isPending
            ${CreatorStatus.rejected} | ${false}
            ${CreatorStatus.pending}  | ${true}
            ${CreatorStatus.staged}   | ${false}
        `('should render reply popup with isPending $isPending', ({ status, isPending }) => {
            renderLayer({ status });

            expect(screen.getByTestId('popup-reply').getAttribute('data-is-pending')).toBe(String(isPending));
        });

        test('should not render PopupReply if there is a staged type and mode mismatch', () => {
            // defaults has staged as highlight
            renderLayer({ mode: Mode.REGION });

            expect(screen.queryByTestId('popup-reply')).toBeNull();
        });

        test('should render PopupReply if promoting a highlight and staged exists', () => {
            renderLayer({ mode: Mode.NONE, isPromoting: true });
            expect(screen.getByTestId('popup-reply')).toBeDefined();
        });

        test('should not render PopupReply if promoting a highlight but staged does not exist', () => {
            renderLayer({ mode: Mode.NONE, isPromoting: true, staged: null });
            expect(screen.queryByTestId('popup-reply')).toBeNull();
        });

        test('should render PopupReply if it is a staged drawing', () => {
            renderLayer({ mode: Mode.DRAWING, staged: getStagedDrawing() });
            expect(screen.getByTestId('popup-reply')).toBeDefined();
        });

        test('should pass isThreadedAnnotation to PopupReply', () => {
            renderLayer({ isThreadedAnnotation: true });
            expect(screen.getByTestId('popup-reply').getAttribute('data-is-threaded')).toBe('true');
        });

        test('should default isThreadedAnnotation to false on PopupReply', () => {
            renderLayer();
            expect(screen.getByTestId('popup-reply').getAttribute('data-is-threaded')).toBe('false');
        });
    });

    describe('event handlers', () => {
        describe('handleCancel()', () => {
            test('should reset creator and reset isPromoting', () => {
                const resetCreator = jest.fn();
                renderLayer({ resetCreator });
                mockOnCancel!();

                expect(resetCreator).toHaveBeenCalled();
            });
        });

        describe('handleChange', () => {
            test('should set the staged state with the new message', () => {
                const setMessage = jest.fn();
                renderLayer({ setMessage });
                mockOnChange!('foo');

                expect(setMessage).toHaveBeenCalledWith('foo');
            });

            test('should set the staged state with empty string', () => {
                const setMessage = jest.fn();
                renderLayer({ setMessage });
                mockOnChange!();

                expect(setMessage).toHaveBeenCalledWith('');
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

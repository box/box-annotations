import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import PopupReply, { Props } from '../PopupReply';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
}));

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

jest.mock('../PopupBase', () => {
    const ReactMock = jest.requireActual('react');
    const MockPopupBase = ReactMock.forwardRef(
        ({ children, options, ...rest }: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) =>
            ReactMock.createElement(
                'div',
                { ref, 'data-testid': 'popup-base', 'data-options': JSON.stringify(options), ...rest },
                children,
            ),
    );
    MockPopupBase.displayName = 'MockPopupBase';
    return MockPopupBase;
});

jest.mock('../../ReplyForm', () => {
    const ReactMock = jest.requireActual('react');
    return ({ isPending, value, ...rest }: Record<string, unknown>) =>
        ReactMock.createElement('div', {
            'data-testid': 'reply-form',
            'data-pending': String(isPending),
            'data-value': value || '',
            ...rest,
        });
});

describe('PopupReply', () => {
    const defaults: Props = {
        isPending: false,
        onCancel: jest.fn(),
        onChange: jest.fn(),
        onSubmit: jest.fn(),
        reference: document.createElement('div'),
    };

    beforeEach(() => {
        mockUseSelector.mockReturnValue(0);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('render()', () => {
        test('should render the ReplyForm', () => {
            render(<PopupReply {...defaults} />);

            expect(screen.getByTestId('popup-base')).toBeVisible();
            expect(screen.getByTestId('reply-form')).toBeVisible();
        });

        test('should pass value prop to ReplyForm', () => {
            render(<PopupReply {...defaults} value="test value" />);

            const replyForm = screen.getByTestId('reply-form');
            expect(replyForm.getAttribute('data-value')).toBe('test value');
        });

        test('should pass isPending prop to ReplyForm', () => {
            render(<PopupReply {...defaults} isPending />);

            const replyForm = screen.getByTestId('reply-form');
            expect(replyForm.getAttribute('data-pending')).toBe('true');
        });
    });

    describe('useEffect popper update', () => {
        test('should call useSelector for rotation and scale values', () => {
            mockUseSelector.mockReturnValueOnce(0).mockReturnValueOnce(1);

            render(<PopupReply {...defaults} />);

            expect(mockUseSelector).toHaveBeenCalledTimes(2);
        });

        test('should re-render when rotation/scale changes', () => {
            mockUseSelector.mockReturnValue(0);

            const { rerender } = render(<PopupReply {...defaults} />);
            const callCountAfterFirstRender = mockUseSelector.mock.calls.length;

            mockUseSelector.mockReturnValue(90);
            rerender(<PopupReply {...defaults} />);

            expect(mockUseSelector.mock.calls.length).toBeGreaterThan(callCountAfterFirstRender);
        });
    });

    describe('Popup options', () => {
        test('should pass options to PopupBase', () => {
            render(<PopupReply {...defaults} />);

            const popupBase = screen.getByTestId('popup-base');
            const options = JSON.parse(popupBase.getAttribute('data-options') || '{}');

            expect(options).toHaveProperty('placement');
            expect(options).toHaveProperty('modifiers');
            expect(Array.isArray(options.modifiers)).toBe(true);
        });

        test('should maintain the same options reference between renders', () => {
            const { rerender } = render(<PopupReply {...defaults} />);
            const optionsBefore = screen.getByTestId('popup-base').getAttribute('data-options');

            rerender(<PopupReply {...defaults} />);
            const optionsAfter = screen.getByTestId('popup-base').getAttribute('data-options');

            expect(optionsBefore).toBe(optionsAfter);
        });

        test('should include required modifiers in options', () => {
            render(<PopupReply {...defaults} />);

            const popupBase = screen.getByTestId('popup-base');
            const options = JSON.parse(popupBase.getAttribute('data-options') || '{}');

            const modifierNames = options.modifiers.map((m: { name: string }) => m.name);
            expect(modifierNames).toContain('arrow');
            expect(modifierNames).toContain('flip');
            expect(modifierNames).toContain('offset');
            expect(modifierNames).toContain('preventOverflow');
        });
    });
});

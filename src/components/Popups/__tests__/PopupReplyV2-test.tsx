import React from 'react';
import { render, screen } from '@testing-library/react';
import PopupReplyV2 from '../PopupReplyV2';

describe('PopupReplyV2', () => {
    test('should render v2 with correct test id', () => {
        render(<PopupReplyV2 />);
        expect(screen.getByTestId('popup-reply-v2')).toBeDefined();
    });
});

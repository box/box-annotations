import React from 'react';
import { render, screen } from '@testing-library/react';
import PopupList, { Props } from '../PopupList';
import { Collaborator } from '../../../@types';

describe('PopupList', () => {
    const defaults: Props<Collaborator> = {
        items: [],
        onSelect: jest.fn(),
        reference: document.createElement('div'),
    };

    test('renders a prompt when there are no items', () => {
        const { container } = render(<PopupList {...defaults} />);

        expect(container.querySelector('.ba-PopupList')).toBeInTheDocument();
        expect(container.querySelector('.ba-PopupList-prompt')).toBeInTheDocument();
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    test('renders the item list when items are provided', () => {
        const items: Collaborator[] = [
            { id: 'a', name: 'Alice', item: { id: 'a', name: 'Alice', type: 'user' } },
            { id: 'b', name: 'Bob', item: { id: 'b', name: 'Bob', type: 'user' } },
        ];

        render(<PopupList {...defaults} items={items} />);

        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getAllByRole('option')).toHaveLength(2);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });
});

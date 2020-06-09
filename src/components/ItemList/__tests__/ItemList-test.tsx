import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import ItemList, { Props } from '../ItemList';
import { Collaborator } from '../../../@types';

describe('components/ItemList/ItemList', () => {
    const defaults: Props<Collaborator> = {
        items: [
            { id: 'testid1', name: 'test1', item: { id: 'testid1', name: 'test1', type: 'user' } },
            { id: 'testid2', name: 'test2', item: { id: 'testid2', name: 'test2', type: 'group' } },
        ],
        onSelect: jest.fn(),
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<ItemList {...defaults} {...props} />);

    describe('render()', () => {
        test('should render elements with correct props', () => {
            const wrapper = getWrapper({ activeItemIndex: 1 });

            const itemList = wrapper.find('[data-testid="ba-ItemList"]');
            const firstChild = itemList.childAt(0);
            const secondChild = itemList.childAt(1);

            expect(itemList.props()).toMatchObject({
                role: 'listbox',
            });
            expect(itemList.children()).toHaveLength(2);
            expect(firstChild.prop('className')).toEqual('ba-ItemList-row');
            expect(firstChild.prop('isActive')).toEqual(false);
            expect(secondChild.prop('isActive')).toEqual(true);
        });

        test('should trigger events', () => {
            const mockSetIndex = jest.fn();
            const mockEvent = {
                preventDefault: jest.fn(),
            };

            const wrapper = getWrapper({ onActivate: mockSetIndex });
            const firstChild = wrapper.find('[data-testid="ba-ItemList"]').childAt(0);

            firstChild.simulate('click', mockEvent);
            expect(defaults.onSelect).toBeCalledWith(0, mockEvent);

            firstChild.simulate('mousedown', mockEvent);
            expect(mockEvent.preventDefault).toBeCalled();

            firstChild.simulate('mouseenter');
            expect(mockSetIndex).toBeCalledWith(0);
        });
    });
});

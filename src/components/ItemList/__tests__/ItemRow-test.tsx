import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { UserMini } from '../../../@types';
import ItemRow, { Props } from '../ItemRow';

describe('components/ItemList/ItemRow', () => {
    const item = { email: 'test@box.com', id: 'testid', name: 'testname', type: 'user' } as UserMini;
    const defaults: Props = {
        item: {
            id: 'testid',
            item,
            name: 'testname',
        },
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<ItemRow {...defaults} {...props} />);

    describe('render()', () => {
        test('should not render anything if no item name', () => {
            const wrapper = getWrapper({ item: {} });

            expect(wrapper.isEmptyRender()).toBe(true);
        });

        test('should render item name and email', () => {
            const wrapper = getWrapper();

            expect(wrapper.find('[data-testid="ba-ItemRow-name"]').text()).toBe('testname');
            expect(wrapper.find('[data-testid="ba-ItemRow-email"]').text()).toBe('test@box.com');
        });

        test('should not render email if item has no email', () => {
            const wrapper = getWrapper({ item: { id: 'testid', name: 'testname', type: 'group' } });

            expect(wrapper.exists('[data-testid="ba-ItemRow-email"]')).toBeFalsy();
        });
    });
});

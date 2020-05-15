import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DatalistItem from 'box-ui-elements/es/components/datalist-item';
import ItemRow, { Props } from '../ItemRow';

describe('components/Popups/ReplyField/ItemRow', () => {
    const defaults: Props = {
        id: 'testid',
        item: { email: 'test@box.com', id: 'testid', name: 'testname', type: 'user' },
        name: 'testname',
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<ItemRow {...defaults} {...props} />);

    describe('render()', () => {
        test('should render DatalistItem with correct props', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(DatalistItem).props()).toMatchObject({
                id: 'testid',
                name: 'testname',
            });
        });

        test('should not render anything if no item', () => {
            const wrapper = getWrapper({ item: null });

            expect(wrapper.exists(DatalistItem)).toBeFalsy();
        });

        test('should not render anything if no item name', () => {
            const wrapper = getWrapper({ item: {} });

            expect(wrapper.exists(DatalistItem)).toBeFalsy();
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

import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupBase from '../PopupBase';
import PopupList, { Props } from '../PopupList';
import { Collaborator } from '../../../@types';

describe('PopupList', () => {
    const defaults: Props<Collaborator> = {
        items: [],
        onSelect: jest.fn(),
        reference: document.createElement('div'),
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<PopupList {...defaults} {...props} />);

    describe('render()', () => {
        test('should render popupBase with correct props', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(PopupBase).props()).toMatchObject({
                className: 'ba-PopupList',
                reference: defaults.reference,
            });
        });
    });
});

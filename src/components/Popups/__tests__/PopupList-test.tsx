import React from 'react';
import * as ReactPopper from 'react-popper';
import { FormattedMessage } from 'react-intl';
import { mount, ReactWrapper } from 'enzyme';
import ItemList from '../../ItemList';
import PopupBase from '../PopupBase';
import PopupList, { Props } from '../PopupList';
import messages from '../messages';
import { Collaborator } from '../../../@types';

describe('components/Popups/ReplyField/PopupList', () => {
    const defaults: Props<Collaborator> = {
        items: [],
        onSelect: jest.fn(),
        reference: document.createElement('div'),
    };
    const getWrapper = (props = {}): ReactWrapper => mount(<PopupList {...defaults} {...props} />);
    const popperInstance = {
        attributes: { popper: { 'data-placement': 'bottom' } },
        update: jest.fn(),
        styles: { popper: { top: '10px' } },
    };
    const popperSpy = jest.spyOn(ReactPopper, 'usePopper') as jest.Mock;

    beforeEach(() => {
        popperSpy.mockReturnValue(popperInstance);
    });

    describe('render()', () => {
        test('should call usePopper with the reference and pass its attributes to the popup', () => {
            const wrapper = getWrapper();
            const popup = wrapper.find(PopupBase);

            expect(ReactPopper.usePopper).toHaveBeenCalledWith(
                defaults.reference,
                popup.getDOMNode(),
                expect.any(Object),
            );
            expect(popup.props()).toMatchObject({
                attributes: popperInstance.attributes,
                styles: popperInstance.styles,
            });
        });

        test('should render PopupBase with correct props', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(PopupBase).hasClass('ba-PopupList')).toBe(true);
            expect(wrapper.find(FormattedMessage).prop('id')).toEqual(messages.popupListPrompt.id);
        });

        test('should render ItemList with the number of items passed in', () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const wrapper = getWrapper({ items });

            expect(wrapper.find(ItemList).prop('items')).toEqual(items);
        });
    });
});

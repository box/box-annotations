import React from 'react';
import { ContentState } from 'draft-js';
import { shallow, ShallowWrapper } from 'enzyme';
import MentionItem, { Props } from '../MentionItem';

describe('components/Popups/ReplyField/MentionItem', () => {
    const defaults: Props = {
        children: <div />,
        contentState: ({
            getEntity: () => ({
                getData: () => ({ id: 'testid' }),
            }),
        } as unknown) as ContentState,
        entityKey: 'testEntityKey',
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<MentionItem {...defaults} {...props} />);

    describe('render()', () => {
        test('should render link with correct props', () => {
            const wrapper = getWrapper();

            expect(wrapper.find('[data-testid="ba-MentionItem-link"]').props()).toMatchObject({
                className: 'ba-MentionItem-link',
                href: '/profile/testid',
            });
        });

        test('should not render link if no id', () => {
            const wrapper = getWrapper({
                contentState: ({
                    getEntity: () => ({
                        getData: () => ({}),
                    }),
                } as unknown) as ContentState,
            });

            expect(wrapper.exists('[data-testid="ba-MentionItem-link"]')).toBeFalsy();
            expect(wrapper.exists('[data-testid="ba-MentionItem-text"]')).toBeTruthy();
        });
    });
});

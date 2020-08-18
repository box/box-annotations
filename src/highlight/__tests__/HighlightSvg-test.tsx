import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightSvg from '../HighlightSvg';

type Props = {
    children?: React.ReactNode;
    className?: string;
};

describe('HighlightSvg', () => {
    const getWrapper = (props: Props): ShallowWrapper => shallow(<HighlightSvg {...props} />);

    describe('render', () => {
        test('should render svg with classname', () => {
            const wrapper = getWrapper({ className: 'foo' });
            const svg = wrapper.find('svg');

            expect(svg.hasClass('foo')).toBe(true);
        });
    });
});

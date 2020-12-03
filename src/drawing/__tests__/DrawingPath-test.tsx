import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { DrawingPathBase as DrawingPath, Props } from '../DrawingPath';

describe('DrawingPath', () => {
    const getDefaults = (): Props => ({
        pathCommands: 'abc',
    });
    const getWrapper = (props?: Props): ShallowWrapper => shallow(<DrawingPath {...getDefaults()} {...props} />);

    test('render', () => {
        const wrapper = getWrapper({ className: 'foo' });

        expect(wrapper.props()).toMatchObject({
            className: 'foo',
            d: 'abc',
            strokeLinecap: 'round',
            vectorEffect: 'non-scaling-stroke',
        });
    });
});

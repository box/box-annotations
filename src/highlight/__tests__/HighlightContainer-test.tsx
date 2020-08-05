import * as React from 'react';
import { IntlShape } from 'react-intl';
import { mount, ReactWrapper } from 'enzyme';
import HighlightAnnotations from '../HighlightAnnotations';
import HighlightContainer, { Props } from '../HighlightContainer';
import { createStore } from '../../store';

jest.mock('../../common/withProviders');
jest.mock('../HighlightAnnotations');

describe('highlight/HighlightContainer', () => {
    const defaults = {
        intl: {} as IntlShape,
        location: 1,
        store: createStore(),
    };
    const getWrapper = (props = {}): ReactWrapper<Props> => mount(<HighlightContainer {...defaults} {...props} />);

    describe('render', () => {
        test('should connect the underlying component and wrap it with a root provider', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists('RootProvider')).toBe(true);
            expect(wrapper.find(HighlightAnnotations).props()).toMatchObject({
                activeAnnotationId: null,
                annotations: [],
                isCreating: false,
                setActiveAnnotationId: expect.any(Function),
            });
        });
    });
});

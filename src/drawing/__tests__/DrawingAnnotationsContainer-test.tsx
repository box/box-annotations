import * as React from 'react';
import { IntlShape } from 'react-intl';
import { Store } from 'redux';
import { mount, ReactWrapper } from 'enzyme';
import DrawingAnnotations from '../DrawingAnnotations';
import DrawingAnnotationsContainer, { Props } from '../DrawingAnnotationsContainer';
import { createStore } from '../../store';

jest.mock('../../common/withProviders');

describe('DrawingAnnotationsContainer', () => {
    const getDefaults = (): {
        intl: IntlShape;
        location: number;
        store: Store;
    } => ({
        intl: {} as IntlShape,
        location: 1,
        store: createStore(),
    });
    const getWrapper = (props = {}): ReactWrapper<Props> =>
        mount(<DrawingAnnotationsContainer {...getDefaults()} {...props} />);

    describe('render', () => {
        test('should connect the underlying component and wrap it with a root provider', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists('RootProvider')).toBe(true);
            expect(wrapper.find(DrawingAnnotations).props()).toMatchObject({
                activeAnnotationId: null,
                annotations: [],
                drawnPathGroups: [],
                isCreating: false,
            });
        });
    });
});

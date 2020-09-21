import * as React from 'react';
import { IntlShape } from 'react-intl';
import { mount, ReactWrapper } from 'enzyme';
import RegionAnnotations from '../RegionAnnotations';
import RegionContainer, { Props } from '../RegionContainer';
import { createStore, CreatorStatus } from '../../store';

jest.mock('../../common/withProviders');
jest.mock('../RegionAnnotations');

describe('RegionContainer', () => {
    const defaults = {
        intl: {} as IntlShape,
        location: 1,
        store: createStore(),
    };
    const getWrapper = (props = {}): ReactWrapper<Props> => mount(<RegionContainer {...defaults} {...props} />);

    describe('render', () => {
        test('should connect the underlying component and wrap it with a root provider', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists('RootProvider')).toBe(true);
            expect(wrapper.find(RegionAnnotations).props()).toMatchObject({
                activeAnnotationId: null,
                annotations: [],
                createRegion: expect.any(Function),
                isCreating: false,
                isDiscoverabilityEnabled: false,
                location: 1,
                message: '',
                staged: null,
                status: CreatorStatus.init,
                setActiveAnnotationId: expect.any(Function),
                setMessage: expect.any(Function),
                setStaged: expect.any(Function),
                setStatus: expect.any(Function),
                store: defaults.store,
            });
        });

        test.each`
            rotation     | isRotated
            ${null}      | ${false}
            ${undefined} | ${false}
            ${0}         | ${false}
            ${90}        | ${true}
            ${360}       | ${true}
            ${-360}      | ${true}
            ${-90}       | ${true}
            ${-0}        | ${false}
        `('should set the isRotated prop based on the rotation angle value', ({ isRotated, rotation }) => {
            const store = createStore({ options: { rotation } });
            const wrapper = getWrapper({ store });

            expect(wrapper.find(RegionAnnotations).prop('isRotated')).toEqual(isRotated);
        });

        test('should read the discoverability feature from the store', () => {
            const store = createStore({ options: { features: { discoverability: true } } });
            const wrapper = getWrapper({ store });

            expect(wrapper.find(RegionAnnotations).prop('isDiscoverabilityEnabled')).toBe(true);
        });
    });
});

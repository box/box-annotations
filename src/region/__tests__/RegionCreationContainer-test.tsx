import * as React from 'react';
import { IntlShape } from 'react-intl';
import { mount, ReactWrapper } from 'enzyme';
import RegionCreation from '../RegionCreation';
import RegionCreationContainer, { Props } from '../RegionCreationContainer';
import { createStore, CreatorStatus, Mode } from '../../store';
import { TARGET_TYPE } from '../../constants';

jest.mock('../../common/withProviders');
jest.mock('../RegionCreation');

describe('RegionCreationContainer', () => {

    const referenceEl = document.createElement('div');
    const defaults = {
        intl: {} as IntlShape,
        location: 1,
        store: createStore(),
        referenceEl,
    };
    const getWrapper = (props = {}): ReactWrapper<Props> => mount(<RegionCreationContainer targetType={TARGET_TYPE.PAGE} {...defaults} {...props} />);

    describe('render', () => {
        test('should connect the underlying component and wrap it with a root provider', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists('RootProvider')).toBe(true);
            expect(wrapper.find(RegionCreation).props()).toMatchObject({
                isCreating: false,
                location: 1,
                staged: null,
                targetType: 'page',
                referenceEl,
                setReferenceId: expect.any(Function),
                setStaged: expect.any(Function),
                setStatus: expect.any(Function),
                store: defaults.store,
            });
        });

        test('should connect the underlying component and wrap it with a root provider for video annotations', () => {
            const wrapper = getWrapper({ targetType: 'frame' as const, location: -1 ,referenceEl: { currentTime: 10 } as HTMLVideoElement});
            expect(wrapper.exists('RootProvider')).toBe(true);
            expect(wrapper.find(RegionCreation).props()).toMatchObject({
                isCreating: false,
                location: -1,
                referenceEl: { currentTime: 10 } as HTMLVideoElement,
                targetType: 'frame',
                setReferenceId: expect.any(Function),
                setStaged: expect.any(Function),
                setStatus: expect.any(Function),
                resetCreator: expect.any(Function),
            });
        });

        test.each`
            mode              | status                   | isCreating
            ${Mode.NONE}      | ${CreatorStatus.staged}  | ${false}
            ${Mode.HIGHLIGHT} | ${CreatorStatus.staged}  | ${false}
            ${Mode.REGION}    | ${CreatorStatus.staged}  | ${true}
            ${Mode.REGION}    | ${CreatorStatus.pending} | ${false}
        `(
            'should pass down isCreating as $isCreating if mode is $mode and status is $status',
            ({ mode, isCreating, status }) => {
                const store = createStore({ common: { mode }, creator: { status } });
                const wrapper = getWrapper({ store });

                expect(wrapper.find(RegionCreation).prop('isCreating')).toEqual(isCreating);
            },
        );

        test.each`
            rotation
            ${0}
            ${90}
            ${-90}
            ${-180}
            ${-270}
        `('should pass rotation=$rotation to the underlying component', ({ rotation }) => {
            const store = createStore({ options: { rotation } });
            const wrapper = getWrapper({ store });

            expect(wrapper.find(RegionCreation).prop('rotation')).toEqual(rotation);
        });
    });
});

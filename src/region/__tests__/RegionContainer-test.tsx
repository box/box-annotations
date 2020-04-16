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
        page: 1,
        scale: 1,
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
                page: defaults.page,
                scale: defaults.scale,
                staged: null,
                status: CreatorStatus.init,
                setStaged: expect.any(Function),
                setStatus: expect.any(Function),
                store: defaults.store,
            });
        });
    });
});

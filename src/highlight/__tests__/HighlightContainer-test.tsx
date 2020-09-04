import React from 'react';
import { IntlShape } from 'react-intl';
import { ReactWrapper, mount } from 'enzyme';
import HighlightAnnotations from '../HighlightAnnotations';
import HighlightContainer, { Props } from '../HighlightContainer';
import { CreatorItemHighlight, CreatorItemRegion, Mode, createStore, CreatorStatus } from '../../store';
import { rect as highlightRect } from '../__mocks__/data';
import { rect as regionRect } from '../../region/__mocks__/data';

jest.mock('../../common/withProviders');
jest.mock('../HighlightAnnotations');

const stagedHighlight: CreatorItemHighlight = {
    location: 1,
    shapes: [highlightRect],
};

const stagedRegion: CreatorItemRegion = {
    location: 1,
    shape: regionRect,
};

describe('HighlightContainer', () => {
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
                createHighlight: expect.any(Function),
                isCreating: false,
                isPromoting: false,
                location: 1,
                message: '',
                resetCreator: expect.any(Function),
                selection: null,
                setActiveAnnotationId: expect.any(Function),
                setIsPromoting: expect.any(Function),
                setMessage: expect.any(Function),
                setStaged: expect.any(Function),
                setStatus: expect.any(Function),
                staged: null,
                status: CreatorStatus.init,
                store: defaults.store,
            });
        });

        test.each`
            mode              | isCreating
            ${Mode.NONE}      | ${false}
            ${Mode.HIGHLIGHT} | ${true}
            ${Mode.REGION}    | ${false}
        `('should pass down isCreating as $isCreating if mode is $mode', ({ mode, isCreating }) => {
            const store = createStore({ common: { mode } });
            const wrapper = getWrapper({ store });

            expect(wrapper.find(HighlightAnnotations).prop('isCreating')).toEqual(isCreating);
        });

        test.each`
            staged             | expectedStaged
            ${stagedHighlight} | ${stagedHighlight}
            ${stagedRegion}    | ${null}
            ${null}            | ${null}
        `('should only pass down staged if it is a staged highlight', ({ staged, expectedStaged }) => {
            const store = createStore({ creator: { staged } });
            const wrapper = getWrapper({ store });

            expect(wrapper.find(HighlightAnnotations).prop('staged')).toEqual(expectedStaged);
        });
    });
});

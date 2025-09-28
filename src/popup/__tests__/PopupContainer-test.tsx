import * as React from 'react';
import { IntlShape } from 'react-intl';
import { mount, ReactWrapper } from 'enzyme';
import PopupLayer from '../PopupLayer';
import PopupContainer, { Props } from '../PopupContainer';
import { createStore, CreatorStatus, Mode } from '../../store';
import { PAGE } from '../../constants'; 

jest.mock('../PopupLayer');
jest.mock('../../common/withProviders');

describe('PopupContainer', () => {
    const defaults = {
        intl: {} as IntlShape,
        location: 1,
        store: createStore(),
    };
    // Define PAGE if not already imported
    const getWrapper = (props = {}): ReactWrapper<Props> =>
        mount(
            <PopupContainer
                targetType={PAGE}
                {...defaults}
                {...props}
            />
        );

    describe('render', () => {
        test('should connect the underlying component and wrap it with a root provider', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists('RootProvider')).toBe(true);
            expect(wrapper.find(PopupLayer).props()).toMatchObject({
                createDrawing: expect.any(Function),
                createHighlight: expect.any(Function),
                createRegion: expect.any(Function),
                isPromoting: false,
                mode: Mode.NONE,
                referenceId: null,
                resetCreator: expect.any(Function),
                setMessage: expect.any(Function),
                staged: null,
                status: CreatorStatus.init,
                store: defaults.store,
            });
        });
    });
});

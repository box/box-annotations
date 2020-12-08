import * as React from 'react';
import { IntlShape } from 'react-intl';
import { Store } from 'redux';
import { mount, ReactWrapper } from 'enzyme';
import DrawingAnnotations from '../DrawingAnnotations';
import DrawingAnnotationsContainer, { Props } from '../DrawingAnnotationsContainer';
import { createStore, CreatorStatus, Mode } from '../../store';

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

        test.each`
            mode            | status                   | isCreating
            ${Mode.NONE}    | ${CreatorStatus.staged}  | ${false}
            ${Mode.DRAWING} | ${CreatorStatus.staged}  | ${true}
            ${Mode.DRAWING} | ${CreatorStatus.pending} | ${false}
            ${Mode.REGION}  | ${CreatorStatus.staged}  | ${false}
        `(
            'should pass down isCreating as $isCreating if mode is $mode and status is $status',
            ({ mode, isCreating, status }) => {
                const store = createStore({
                    common: { mode },
                    creator: { status },
                    options: { features: { drawingCreate: true } },
                });
                const wrapper = getWrapper({ store });

                expect(wrapper.find(DrawingAnnotations).prop('isCreating')).toEqual(isCreating);
            },
        );
    });
});

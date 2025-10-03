import * as React from 'react';
import { IntlShape } from 'react-intl';
import { Store } from 'redux';
import { mount, ReactWrapper } from 'enzyme';
import DrawingAnnotations from '../DrawingAnnotations';
import DrawingAnnotationsContainer, { Props } from '../DrawingAnnotationsContainer';
import { createStore, CreatorStatus, Mode } from '../../store';
import { TARGET_TYPE } from '../../constants';

jest.mock('../../common/useIsListInteractive');
jest.mock('../../common/withProviders');

describe('DrawingAnnotationsContainer', () => {
    const initialState = {
        common: { color: '#000' },
    };

    const getDefaults = (): {
        intl: IntlShape;
        location: number;
        store: Store;
    } => ({
        intl: {} as IntlShape,
        location: 1,
        store: createStore(initialState),
    });
    const getWrapper = (props = {}): ReactWrapper<Props> =>
        mount(<DrawingAnnotationsContainer targetType={TARGET_TYPE.PAGE} {...getDefaults()} {...props} />);

    describe('render', () => {
        test('should connect the underlying component and wrap it with a root provider', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists('RootProvider')).toBe(true);
            expect(wrapper.find(DrawingAnnotations).props()).toMatchObject({
                activeAnnotationId: null,
                addDrawingPathGroup: expect.any(Function),
                annotations: [],
                canShowPopupToolbar: false,
                color: '#000',
                drawnPathGroups: [],
                isCreating: false,
                location: 1,
                resetDrawing: expect.any(Function),
                setActiveAnnotationId: expect.any(Function),
                setReferenceId: expect.any(Function),
                setStaged: expect.any(Function),
                setStatus: expect.any(Function),
                setupDrawing: expect.any(Function),
                stashedPathGroups: [],
                undoDrawingPathGroup: expect.any(Function),
            });
        });

        test.each`
            status                    | canShowPopupToolbar
            ${CreatorStatus.init}     | ${false}
            ${CreatorStatus.pending}  | ${false}
            ${CreatorStatus.rejected} | ${false}
            ${CreatorStatus.staged}   | ${false}
            ${CreatorStatus.started}  | ${true}
        `(
            'should set canShowPopupToolbar as $canShowPopupToolbar if status is $status',
            ({ canShowPopupToolbar, status }) => {
                const store = createStore({
                    common: { mode: Mode.DRAWING },
                    creator: { status },
                });
                const wrapper = getWrapper({ store });

                expect(wrapper.find(DrawingAnnotations).prop('canShowPopupToolbar')).toEqual(canShowPopupToolbar);
            },
        );

        test.each`
            mode            | status                   | isCreating
            ${Mode.NONE}    | ${CreatorStatus.staged}  | ${false}
            ${Mode.DRAWING} | ${CreatorStatus.init}    | ${true}
            ${Mode.DRAWING} | ${CreatorStatus.started} | ${true}
            ${Mode.DRAWING} | ${CreatorStatus.staged}  | ${true}
            ${Mode.DRAWING} | ${CreatorStatus.pending} | ${false}
            ${Mode.REGION}  | ${CreatorStatus.staged}  | ${false}
        `(
            'should pass down isCreating as $isCreating if mode is $mode and status is $status',
            ({ mode, isCreating, status }) => {
                const store = createStore({
                    common: { mode },
                    creator: { status },
                });
                const wrapper = getWrapper({ store });

                expect(wrapper.find(DrawingAnnotations).prop('isCreating')).toEqual(isCreating);
            },
        );
    });
});

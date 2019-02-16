import * as React from 'react';
import { shallow } from 'enzyme';

import ActionControls from '../ActionControls';

const onCreate = jest.fn();
const onCommentClick = jest.fn();
const onCancel = jest.fn();
const onDelete = jest.fn();

const event = {
    stopPropagation: jest.fn(),
    preventDefault: jest.fn()
};

describe('components/ActionControls', () => {
    const render = (props = {}) =>
        shallow(
            <ActionControls
                isPending={false}
                canDelete={false}
                hasComments={false}
                onCreate={onCreate}
                onCommentClick={onCommentClick}
                onDelete={onDelete}
                onCancel={onCancel}
                {...props}
            />
        );

    test('should render no controls if the type does not match a valid type', () => {
        const wrapper = render({ type: 'invalid' });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('HighlightControls').exists()).toBeFalsy();
        expect(wrapper.find('DrawingControls').exists()).toBeFalsy();
        expect(wrapper.find('ApprovalCommentForm').exists()).toBeFalsy();
    });

    test('should render no controls if user cannot delete or comment on a plain highlight annotation', () => {
        const wrapper = render({ type: 'highlight' });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('HighlightControls').exists()).toBeFalsy();
        expect(wrapper.find('DrawingControls').exists()).toBeFalsy();
        expect(wrapper.find('ApprovalCommentForm').exists()).toBeFalsy();
    });

    test('should correctly render controls for plain highlight annotations without delete permissions', () => {
        const wrapper = render({ type: 'highlight', canComment: true });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('HighlightControls').exists()).toBeTruthy();
    });

    test('should correctly render controls for plain highlight annotations without comment permissions', () => {
        const wrapper = render({ type: 'highlight', canDelete: true });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('HighlightControls').exists()).toBeTruthy();
    });

    test('should correctly render controls for plain highlight annotations', () => {
        const wrapper = render({ canDelete: true, type: 'highlight' });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('HighlightControls').exists()).toBeTruthy();
    });

    test('should correctly render controls for pending highlight comment annotations', () => {
        const wrapper = render({ isPending: true, type: 'highlight-comment' });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('ApprovalCommentForm').exists()).toBeTruthy();
    });

    test('should correctly render controls for highlight comment annotations without any existing comments', () => {
        const wrapper = render({ type: 'highlight-comment', hasComments: true });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('ApprovalCommentForm').exists()).toBeTruthy();
    });

    test('should correctly render controls for highlight comment annotations', () => {
        const wrapper = render({ type: 'highlight-comment' });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('HighlightControls').exists()).toBeTruthy();
    });

    test('should render no controls if user cannot delete or comment on a plain highlight annotation', () => {
        const wrapper = render({ type: 'draw' });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('HighlightControls').exists()).toBeFalsy();
        expect(wrapper.find('DrawingControls').exists()).toBeFalsy();
        expect(wrapper.find('ApprovalCommentForm').exists()).toBeFalsy();
    });

    test('should correctly render controls for drawing annotations', () => {
        const wrapper = render({ type: 'draw', canDelete: true });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('DrawingControls').exists()).toBeTruthy();
    });

    test('should correctly render controls for point annotations', () => {
        const wrapper = render({ type: 'point' });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('ApprovalCommentForm').exists()).toBeTruthy();
    });

    test('should update state and call onDelete() prop on delete button click', () => {
        const wrapper = render({ canDelete: true, type: 'highlight' });
        const instance = wrapper.instance();

        instance.onDelete(event);
        wrapper.update();

        expect(event.stopPropagation).toBeCalled();
        expect(event.preventDefault).toBeCalled();
        expect(onDelete).toBeCalled();
        expect(wrapper.state().isInputOpen).toEqual(false);
    });

    test('should update state and call onCreate() prop on create button click', () => {
        const wrapper = render({ canDelete: true, type: 'highlight' });
        const instance = wrapper.instance();

        instance.onCreate(event);
        wrapper.update();

        expect(onCreate).toBeCalled();
        expect(wrapper.state().isInputOpen).toEqual(true);
    });

    test('should update state and call onCancel() prop on cancel button click', () => {
        const wrapper = render({ canDelete: true, type: 'highlight' });
        const instance = wrapper.instance();

        instance.onCancel(event);
        wrapper.update();

        expect(event.stopPropagation).toBeCalled();
        expect(event.preventDefault).toBeCalled();
        expect(onCancel).toBeCalled();
        expect(wrapper.state().isInputOpen).toEqual(false);
    });

    test('should update state to open the input onFocus()', () => {
        const wrapper = render({ canDelete: true, type: 'highlight' });
        const instance = wrapper.instance();

        instance.onFocus(event);
        wrapper.update();

        expect(wrapper.state().isInputOpen).toEqual(true);
    });

    test('should update state to close the input componentWillUnmount()', () => {
        const wrapper = render({ canDelete: true, type: 'highlight' });
        const instance = wrapper.instance();

        instance.componentWillUnmount(event);
        wrapper.update();

        expect(wrapper.state().isInputOpen).toEqual(false);
    });

    test('should focus the input on componentDidMount()', () => {
        const wrapper = render({ canDelete: true, type: 'highlight' });
        expect(wrapper.state().isInputOpen).toEqual(true);
    });
});

import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import RegionCreation from '../RegionCreation';
import RegionCreator from '../RegionCreator';
import RegionRect from '../RegionRect';
import { CreatorItem, CreatorStatus } from '../../store';
import { Rect } from '../../@types';

jest.mock('../../components/Popups/PopupReply');
jest.mock('../RegionCreator');
jest.mock('../RegionRect');

describe('RegionCreation', () => {
    const defaults = {
        location: 1,
        resetCreator: jest.fn(),
        setMessage: jest.fn(),
        setReferenceId: jest.fn(),
        setStaged: jest.fn(),
        setStatus: jest.fn(),
        staged: null,
    };
    const getRect = (): Rect => ({
        type: 'rect',
        height: 50,
        width: 50,
        x: 10,
        y: 10,
    });
    const getStaged = (): CreatorItem => ({
        location: 1,
        shape: getRect(),
    });
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionCreation {...defaults} {...props} />);

    describe('event handlers', () => {
        let wrapper: ShallowWrapper;
        let instance: InstanceType<typeof RegionCreation>;

        beforeEach(() => {
            wrapper = getWrapper({ staged: getStaged() });
            instance = wrapper.instance() as InstanceType<typeof RegionCreation>;
        });

        describe('handleAbort', () => {
            test('should call resetCreator', () => {
                instance.handleAbort();

                expect(defaults.resetCreator).toHaveBeenCalled();
            });
        });

        describe('handleStart', () => {
            test('should reset the creator status', () => {
                instance.handleStart();

                expect(defaults.setStaged).toHaveBeenCalledWith(null);
                expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.started);
            });
        });

        describe('handleStop', () => {
            const shape = {
                type: 'rect' as const,
                height: 10,
                width: 10,
                x: 20,
                y: 20,
            };

            test('should update the staged status and item with the new shape', () => {
                instance.handleStop(shape);

                expect(defaults.setStaged).toHaveBeenCalledWith({
                    location: defaults.location,
                    shape,
                });
                expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.staged);
            });
        });

        describe('handleStagedMount()', () => {
            test('should dispatch setReferenceId with received uuid', () => {
                instance.handleStagedMount('123');

                expect(defaults.setReferenceId).toHaveBeenCalledWith('123');
            });
        });
    });

    describe('render()', () => {
        test('should render a RegionCreator if in creation mode', () => {
            const wrapper = getWrapper({ isCreating: true });
            const creator = wrapper.find(RegionCreator);

            expect(creator.hasClass('ba-RegionCreation-creator')).toBe(true);
        });

        test('should render a RegionAnnotation if one has been drawn', () => {
            const shape = getRect();
            const wrapper = getWrapper({
                staged: {
                    location: 1,
                    message: null,
                    shape,
                },
            });

            expect(wrapper.find(RegionRect).prop('shape')).toEqual(shape);
        });

        test('should not render creation components if not in creation mode', () => {
            const wrapper = getWrapper({
                isCreating: false,
            });

            expect(wrapper.exists(RegionCreator)).toBe(false);
            expect(wrapper.exists(RegionRect)).toBe(false);
        });

        test('should not render creation components if file is rotated', () => {
            const wrapper = getWrapper({
                isRotated: false,
            });

            expect(wrapper.exists(RegionCreator)).toBe(false);
            expect(wrapper.exists(RegionRect)).toBe(false);
        });

        test.each([true, false])(
            'should render RegionCreator with is-discoverability-enabled class based on flag as %s',
            isDiscoverabilityEnabled => {
                const wrapper = getWrapper({ isCreating: true, isDiscoverabilityEnabled });

                expect(wrapper.find(RegionCreator).hasClass('is-discoverability-enabled')).toBe(
                    isDiscoverabilityEnabled,
                );
            },
        );
    });
});

import * as React from 'react';
import { mapStateToProps } from '../HighlightContainer';
import { getAnnotationsForLocation, getAnnotationMode, getCreatorStagedForLocation, AppState } from '../../store';
import { annotation as highlightAnnotation, target as highlightTarget } from '../__mocks__/data';
import { annotation as regionAnnotation, target as regionTarget } from '../../region/__mocks__/data';

jest.mock('../../common/withProviders');
jest.mock('../HighlightAnnotations', () => jest.fn().mockImplementation(() => <div className="foo" />));
jest.mock('../../store', () => ({
    ...jest.requireActual('../../store'),
    getActiveAnnotationId: jest.fn(),
    getAnnotationsForLocation: jest.fn().mockReturnValue([]),
    getAnnotationMode: jest.fn(),
    getCreatorMessage: jest.fn(),
    getCreatorStagedForLocation: jest.fn(),
    getCreatorStatus: jest.fn(),
}));

const stagedHighlight = {
    target: highlightTarget,
};

const stagedRegion = {
    target: regionTarget,
};

describe('HighlightContainer', () => {
    describe('mapStateToProps()', () => {
        test('should only pass down highlight annotations', () => {
            (getAnnotationsForLocation as jest.Mock).mockReturnValue([highlightAnnotation, regionAnnotation]);
            const props = mapStateToProps({} as AppState, { location: 1 });

            expect(props.annotations).toEqual([highlightAnnotation]);
        });

        test.each`
            mode           | isCreating
            ${'none'}      | ${false}
            ${'highlight'} | ${true}
            ${'region'}    | ${false}
        `('should pass down isCreating as $isCreating if mode is $mode', ({ mode, isCreating }) => {
            (getAnnotationMode as jest.Mock).mockReturnValue(mode);
            const props = mapStateToProps({} as AppState, { location: 1 });

            expect(props.isCreating).toBe(isCreating);
        });

        test.each`
            staged             | expectedStaged
            ${stagedHighlight} | ${stagedHighlight}
            ${stagedRegion}    | ${null}
            ${null}            | ${null}
        `('should only pass down staged if it is a staged highlight', ({ staged, expectedStaged }) => {
            (getCreatorStagedForLocation as jest.Mock).mockReturnValue(staged);
            const props = mapStateToProps({} as AppState, { location: 1 });

            expect(props.staged).toEqual(expectedStaged);
        });
    });
});

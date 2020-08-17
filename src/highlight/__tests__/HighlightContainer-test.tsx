import { AppState, getAnnotationsForLocation, getAnnotationMode, getCreatorStagedForLocation, Mode } from '../../store';
import { annotation as highlightAnnotation, target as highlightTarget } from '../__mocks__/data';
import { annotation as regionAnnotation, target as regionTarget } from '../../region/__mocks__/data';
import { mapStateToProps } from '../HighlightContainer';

jest.mock('../../common/withProviders');
jest.mock('../HighlightAnnotations');
jest.mock('../../store');

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
            mode              | isCreating
            ${Mode.NONE}      | ${false}
            ${Mode.HIGHLIGHT} | ${true}
            ${Mode.REGION}    | ${false}
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

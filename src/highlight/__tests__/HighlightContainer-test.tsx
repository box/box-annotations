import {
    AppState,
    CreatorItemHighlight,
    CreatorItemRegion,
    getAnnotationMode,
    getAnnotationsForLocation,
    getCreatorStagedForLocation,
    getIsPromoting,
    Mode,
    getIsSelecting,
} from '../../store';
import { annotation as highlightAnnotation, rect as highlightRect } from '../__mocks__/data';
import { annotation as regionAnnotation, rect as regionRect } from '../../region/__mocks__/data';
import { mapStateToProps } from '../HighlightContainer';

jest.mock('../../common/withProviders');
jest.mock('../HighlightAnnotations');
jest.mock('../../store');

const stagedHighlight: CreatorItemHighlight = {
    location: 1,
    shapes: [highlightRect],
};

const stagedRegion: CreatorItemRegion = {
    location: 1,
    shape: regionRect,
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
        `(
            'should pass down isCreating as $isCreating if mode is $mode and isPromoting is $isPromoting',
            ({ mode, isCreating, isPromoting }) => {
                (getAnnotationMode as jest.Mock).mockReturnValue(mode);
                (getIsPromoting as jest.Mock).mockReturnValue(isPromoting);
                const props = mapStateToProps({} as AppState, { location: 1 });

                expect(props.isCreating).toBe(isCreating);
            },
        );

        test.each([false, true])('should map isPromoting based on the selector %s', isPromoting => {
            (getIsPromoting as jest.Mock).mockReturnValue(isPromoting);
            const props = mapStateToProps({} as AppState, { location: 1 });

            expect(props.isPromoting).toBe(isPromoting);
        });

        test.each([false, true])('should map isSelecting based on the selector %s', isSelecting => {
            (getIsSelecting as jest.Mock).mockReturnValue(isSelecting);
            const props = mapStateToProps({} as AppState, { location: 1 });

            expect(props.isSelecting).toBe(isSelecting);
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

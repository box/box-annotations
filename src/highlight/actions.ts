import { AppThunkDispatch, AppState } from '../store';
import { createAnnotationAction } from '../store/annotations';
import { getFileVersionId } from '../store/options';
import { AnnotationHighlight } from '../@types';

export interface CreateArg extends Pick<AnnotationHighlight, 'target'> {
    message: string;
}

export const createHighlightAction = (arg: CreateArg) => (dispatch: AppThunkDispatch, getState: () => AppState) => {
    const { message, target } = arg;
    const state = getState();
    const newAnnotation = {
        description: {
            message,
            type: 'reply' as const,
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        file_version: {
            id: getFileVersionId(state),
        },
        target,
    };

    return dispatch(createAnnotationAction(newAnnotation));
};

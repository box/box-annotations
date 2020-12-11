import { PathGroup } from '../../@types';
import { AppState } from '../types';

type State = Pick<AppState, 'drawing'>;

export const getDrawingDrawnPathGroupsForLocation = (state: State, location: number): Array<PathGroup> =>
    state.drawing.location === location ? state.drawing.drawnPathGroups : [];
export const getStashedDrawnPathGroupsForLocation = (state: State, location: number): Array<PathGroup> =>
    state.drawing.location === location ? state.drawing.stashedPathGroups : [];

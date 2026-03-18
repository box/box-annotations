import { createAction } from '@reduxjs/toolkit';
import { BoundingBox } from './types';

export const setBoundingBoxHighlightsAction = createAction<BoundingBox[]>('SET_BOUNDING_BOX_HIGHLIGHTS');
export const setSelectedBoundingBoxHighlightAction = createAction<string | null>('SET_SELECTED_BOUNDING_BOX_HIGHLIGHT');
export const navigateBoundingBoxHighlightAction = createAction<string>('NAVIGATE_BOUNDING_BOX_HIGHLIGHT');

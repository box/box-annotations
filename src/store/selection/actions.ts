import { createAction } from '@reduxjs/toolkit';
import { SelectionItem } from './types';

export const setSelectionAction = createAction<SelectionItem | null>('SET_SELECTION');

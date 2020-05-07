import { createReducer } from '@reduxjs/toolkit';
import { fetchCollaboratorsAction } from './actions';
import { UsersState } from './types';

export const initialState = {
    collaborators: null,
};

export default createReducer<UsersState>(initialState, builder =>
    builder.addCase(fetchCollaboratorsAction.fulfilled, (state, { payload }) => {
        state.collaborators = payload.entries;
    }),
);

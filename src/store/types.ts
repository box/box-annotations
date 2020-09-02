import { Action, ThunkDispatch } from '@reduxjs/toolkit';
import { Store } from 'redux';
import API from '../api';
import { AnnotationsState } from './annotations';
import { CommonState } from './common';
import { CreatorState } from './creator';
import { HighlightState } from './highlight';
import { OptionsState } from './options';
import { UsersState } from './users';

export type AppState = {
    annotations: AnnotationsState;
    common: CommonState;
    creator: CreatorState;
    highlight: HighlightState;
    options: OptionsState;
    users: UsersState;
};

export type AppStore = Store<AppState>;
export type AppThunkDispatch = ThunkDispatch<AppState, AppThunkExtra, Action>;

export type AppThunkExtra = {
    api: API;
};

export type AppThunkAPI = {
    dispatch: AppThunkDispatch;
    extra: AppThunkExtra;
    requestId: string;
    signal: AbortSignal;
    state: AppState;
};

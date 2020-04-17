import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import API from '../api';
import createRootReducer from './createRootReducer';
import getEventingMiddleware from './eventing';
import { AppState, AppStore } from './types';

export type Options = {
    api?: API;
};

export default function createStore(preloadedState?: Partial<AppState>, { api }: Options = {}): AppStore {
    const thunkOptions = {
        extraArgument: { api },
    };

    return configureStore({
        devTools: process.env.NODE_ENV === 'dev',
        middleware: [...getDefaultMiddleware({ thunk: thunkOptions }), getEventingMiddleware()],
        preloadedState,
        reducer: createRootReducer(),
    });
}

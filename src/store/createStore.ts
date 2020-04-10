import { Store } from 'redux';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import createRootReducer from './createRootReducer';
import { eventingMiddleware } from './eventing';
import { ApplicationState } from './types';

export default function createStore(preloadedState?: Partial<ApplicationState>): Store {
    return configureStore({
        devTools: process.env.NODE_ENV === 'dev',
        middleware: [...getDefaultMiddleware(), eventingMiddleware],
        preloadedState,
        reducer: createRootReducer(),
    });
}

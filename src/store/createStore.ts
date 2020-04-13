import { Store } from 'redux';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import createRootReducer from './createRootReducer';
import getEventingMiddleware from './eventing';
import { ApplicationState } from './types';

export default function createStore(preloadedState?: Partial<ApplicationState>): Store {
    return configureStore({
        devTools: process.env.NODE_ENV === 'dev',
        middleware: [...getDefaultMiddleware(), getEventingMiddleware()],
        preloadedState,
        reducer: createRootReducer(),
    });
}

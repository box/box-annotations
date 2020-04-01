import { Store } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import createRootReducer from './createRootReducer';
import { ApplicationState } from './types';

export default function createStore(preloadedState?: ApplicationState): Store {
    const store = configureStore({
        reducer: createRootReducer(),
        preloadedState,
        devTools: process.env.NODE_ENV === 'dev',
    });

    return store;
}

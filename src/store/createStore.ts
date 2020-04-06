import { Store } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import createRootReducer from './createRootReducer';
import { ApplicationState } from './types';

export default function createStore(preloadedState?: ApplicationState): Store {
    return configureStore({
        devTools: process.env.NODE_ENV === 'dev',
        preloadedState,
        reducer: createRootReducer(),
    });
}

import { Action } from '@reduxjs/toolkit';
import { ApplicationState } from '../types';

export type EventHandler = (prevState: ApplicationState, nextState: ApplicationState) => void;
export type EventHandlerEntry = Record<Action['type'], EventHandler>;

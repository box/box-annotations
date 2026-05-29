import { Action, SerializedError } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { Annotation } from '../../@types';

export enum Status {
    ERROR = 'error',
    PENDING = 'pending',
    SUCCESS = 'success',
}

export interface Metadata {
    status: Status;
}
export interface ActionEvent {
    annotation: Annotation | undefined;
    error: Error | undefined;
    meta: Metadata;
}

export interface ThunkMeta<M> {
    arg: M;
    requestId: string;
}

export interface AsyncAction<TArg = unknown, TPayload = unknown> extends Action {
    error?: SerializedError;
    meta?: ThunkMeta<TArg>;
    payload?: TPayload;
}

export type EventHandler = (prevState: AppState, nextState: AppState, action: Action | AsyncAction) => void;

export type EventHandlerMap = Record<Action['type'], EventHandler>;

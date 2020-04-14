import { Action, SerializedError } from '@reduxjs/toolkit';
import { ApplicationState } from '../types';
import { Annotation, NewAnnotation } from '../../@types';

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

export interface AsyncAction extends Action {
    error?: SerializedError;
    meta?: ThunkMeta<NewAnnotation>;
    payload?: Annotation;
}

export type EventHandler = (
    prevState: ApplicationState,
    nextState: ApplicationState,
    action: Action | AsyncAction,
) => void;

export type EventHandlerMap = Record<Action['type'], EventHandler>;

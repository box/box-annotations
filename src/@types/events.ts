import { Action, SerializedError } from '@reduxjs/toolkit';
import { ApplicationState } from '../store/types';

export enum Event {
    CREATE_ANNOTATION = 'annotationCreate',
}

export enum Status {
    ERROR = 'error',
    PENDING = 'pending',
    SUCCESS = 'success',
}

export interface Metadata {
    status: Status;
}
export interface ActionEvent {
    annotation: object | undefined;
    error: Error | undefined;
    meta: Metadata;
}

export interface ThunkMeta {
    arg: NewAnnotation;
    requestId: string;
}

export interface AsyncAction {
    error: SerializedError;
    meta: ThunkMeta;
    payload: undefined;
}

export type EventHandler = (prevState: ApplicationState, nextState: ApplicationState, action: Action) => void;
export type EventHandlerMap = Record<Action['type'], EventHandler>;

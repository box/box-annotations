import { Action, SerializedError } from '@reduxjs/toolkit';
import { ApplicationState } from '../store/types';
import { NewAnnotation } from './new';
import { Annotation } from './model';

export enum Event {
    ANNOTATOR = 'annotatorevent',
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

export interface AsyncAction extends Action {
    error?: SerializedError;
    meta?: ThunkMeta;
    payload?: Annotation;
}

export type EventHandler = (
    prevState: ApplicationState,
    nextState: ApplicationState,
    action: Action | AsyncAction,
) => void;
export type EventHandlerMap = Record<Action['type'], EventHandler>;

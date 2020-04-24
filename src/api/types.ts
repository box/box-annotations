import { Annotation, NewAnnotation, Token } from '../@types';

export type APICollection<R> = {
    entries: R[];
    limit: number;
    next_marker: string | null;
};

export type APIError = {
    code: string;
    context_info: unknown;
    help_url: string;
    message: string;
    request_id: string;
    status: number;
    type: 'error';
};

export type APIOptions = {
    apiHost?: string;
    clientName?: string;
    token: Token;
};

export interface AnnotationsAPI {
    createAnnotation(
        fileId: string | null,
        fileVersionId: string | null,
        payload: NewAnnotation,
        successCallback: (result: Annotation) => void,
        errorCallback: (error: APIError) => void,
    ): Promise<void>;

    getAnnotations(
        fileId: string | null,
        fileVersionId: string | null,
        successCallback: (result: APICollection<Annotation>) => void,
        errorCallback: (error: APIError) => void,
        limit?: number,
        shouldFetchAll?: boolean,
    ): Promise<void>;

    destroy(): void;
}

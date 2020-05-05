import { Target } from './model';

export interface NewAnnotation {
    description?: NewReply;
    file_version: {
        id: string | null;
    };
    target: Target;
}

export interface NewReply {
    message: string;
    type: 'reply';
}

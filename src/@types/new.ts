import { Target } from './model';

export interface NewAnnotation {
    description?: NewReply;
    target: Target;
}

export interface NewReply {
    message: string;
    type: 'reply';
}

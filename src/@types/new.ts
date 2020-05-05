import { BoxItemVersionMini } from './api';
import { Target } from './model';

export interface NewAnnotation {
    description?: NewReply;
    file_version: Partial<BoxItemVersionMini>;
    target: Target;
}

export interface NewReply {
    message: string;
    type: 'reply';
}

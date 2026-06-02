import eventManager from '../../common/EventManager';
import { Reply , Event } from '../../@types';
import { AppState } from '../types';
import { AsyncAction, Status } from './types';

type ReplyCreateArg = { annotationId: string; message: string };
type ReplyCreatePayload = { annotationId: string; reply: Reply };

const emitReplyCreateEvent = (
    action: AsyncAction<ReplyCreateArg, ReplyCreatePayload>,
    status: Status,
): void => {
    const { error, meta: { arg, requestId } = {}, payload } = action;
    if (status === Status.SUCCESS && !payload?.reply) return;
    const annotationId = payload?.annotationId ?? arg?.annotationId;
    eventManager.emit(Event.ANNOTATION_REPLY_CREATE, {
        annotation: annotationId ? { id: annotationId } : undefined,
        annotationReply: payload?.reply,
        error,
        meta: { requestId, status },
    });
};

const replyCreateHandler = (status: Status) => (
    _prev: AppState,
    _next: AppState,
    action: AsyncAction,
): void => emitReplyCreateEvent(action as AsyncAction<ReplyCreateArg, ReplyCreatePayload>, status);

const handleReplyCreateErrorEvents = replyCreateHandler(Status.ERROR);
const handleReplyCreatePendingEvents = replyCreateHandler(Status.PENDING);
const handleReplyCreateSuccessEvents = replyCreateHandler(Status.SUCCESS);

export { handleReplyCreateErrorEvents, handleReplyCreatePendingEvents, handleReplyCreateSuccessEvents };

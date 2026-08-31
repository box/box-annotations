import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { AsyncAction, Status } from './types';
import { Event } from '../../@types';

type ReplyDeleteArg = { annotationId: string; replyId: string };
type ReplyDeletePayload = { annotationId: string; replyId: string };

const emitReplyDeleteEvent = (action: AsyncAction<ReplyDeleteArg, ReplyDeletePayload>, status: Status): void => {
    const { error, meta: { arg, requestId } = {}, payload } = action;
    if (status === Status.SUCCESS && !payload) return;
    const annotationId = payload?.annotationId ?? arg?.annotationId;
    const replyId = payload?.replyId ?? arg?.replyId;
    eventManager.emit(Event.ANNOTATION_REPLY_DELETE, {
        annotation: annotationId ? { id: annotationId } : undefined,
        annotationReply: replyId ? { id: replyId } : undefined,
        error,
        meta: { requestId, status },
    });
};

const replyDeleteHandler =
    (status: Status) =>
    (_prev: AppState, _next: AppState, action: AsyncAction): void =>
        emitReplyDeleteEvent(action as AsyncAction<ReplyDeleteArg, ReplyDeletePayload>, status);

const handleReplyDeleteErrorEvents = replyDeleteHandler(Status.ERROR);
const handleReplyDeletePendingEvents = replyDeleteHandler(Status.PENDING);
const handleReplyDeleteSuccessEvents = replyDeleteHandler(Status.SUCCESS);

export { handleReplyDeleteErrorEvents, handleReplyDeletePendingEvents, handleReplyDeleteSuccessEvents };

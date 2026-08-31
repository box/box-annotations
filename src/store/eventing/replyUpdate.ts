import eventManager from '../../common/EventManager';
import { Reply, Event } from '../../@types';
import { AppState } from '../types';
import { AsyncAction, Status } from './types';

type ReplyUpdateArg = {
    annotationId: string;
    replyId: string;
    payload: { message?: string; status?: string };
};
type ReplyUpdatePayload = { annotationId: string; reply: Reply };

const emitReplyUpdateEvent = (action: AsyncAction<ReplyUpdateArg, ReplyUpdatePayload>, status: Status): void => {
    const { error, meta: { arg, requestId } = {}, payload } = action;
    if (status === Status.SUCCESS && !payload?.reply) return;
    const annotationId = payload?.annotationId ?? arg?.annotationId;
    const annotationReply = payload?.reply ?? (arg ? { id: arg.replyId } : undefined);
    eventManager.emit(Event.ANNOTATION_REPLY_UPDATE, {
        annotation: annotationId ? { id: annotationId } : undefined,
        annotationReply,
        error,
        meta: { requestId, status },
    });
};

const replyUpdateHandler =
    (status: Status) =>
    (_prev: AppState, _next: AppState, action: AsyncAction): void =>
        emitReplyUpdateEvent(action as AsyncAction<ReplyUpdateArg, ReplyUpdatePayload>, status);

const handleReplyUpdateErrorEvents = replyUpdateHandler(Status.ERROR);
const handleReplyUpdatePendingEvents = replyUpdateHandler(Status.PENDING);
const handleReplyUpdateSuccessEvents = replyUpdateHandler(Status.SUCCESS);

export { handleReplyUpdateErrorEvents, handleReplyUpdatePendingEvents, handleReplyUpdateSuccessEvents };

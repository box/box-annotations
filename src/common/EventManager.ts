import { EventEmitter } from 'events';
import { Event } from '../store/eventing/types';

class EventManager extends EventEmitter {
    emit(event: string | symbol, ...args: unknown[]): boolean {
        const [data] = args;
        super.emit(event, data);
        super.emit(Event.ANNOTATOR, {
            event,
            data,
        });

        return true;
    }
}

export default new EventManager();

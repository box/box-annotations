import { EventEmitter } from 'events';
import { Event } from '../@types';

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

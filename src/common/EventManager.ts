import { EventEmitter } from 'events';
import { LegacyEvent } from '../@types';

class EventManager extends EventEmitter {
    emit(event: string | symbol, ...args: unknown[]): boolean {
        const [data] = args;
        super.emit(event, data);
        super.emit(LegacyEvent.ANNOTATOR, {
            event,
            data,
        });

        return true;
    }
}

export default new EventManager();

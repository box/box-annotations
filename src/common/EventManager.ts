import { EventEmitter } from 'events';

class EventManager extends EventEmitter {
    emit(event: string | symbol, ...args: unknown[]): boolean {
        const [data] = args;
        super.emit(event, data);
        super.emit('annotatorevent', {
            event,
            data,
        });

        return true;
    }
}

export default new EventManager();

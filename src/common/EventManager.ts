import { EventEmitter } from 'events';

class EventManager extends EventEmitter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emit(event: string | symbol, ...args: any[]): boolean {
        super.emit(event, ...args);
        return super.emit('annotatorevent', {
            event,
            ...args,
        });
    }
}

export default new EventManager();

import { EventEmitter } from 'events';

class EventManager extends EventEmitter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emit(event: string | symbol, ...args: any[]): boolean {
        const [data] = args;
        super.emit(event, data);
        return super.emit('annotatorevent', {
            event,
            data,
        });
    }
}

export default new EventManager();

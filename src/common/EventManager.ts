import { EventEmitter } from 'events';

class EventManager extends EventEmitter {
    emit(event: Event, data?: Record<string, any>): void {
        super.emit(event, data);
        super.emit('annotatorevent', {
            event,
            data,
        });
    }
}

export default new EventManager();

import eventManager from './EventManager';

export default class EventEmitter {
    addListener(event: string | symbol, listener: (...args: any[]) => void): void {
        eventManager.addListener(event, listener);
    }

    emit(event: string | symbol, ...args: any[]): void {
        eventManager.emit(event, ...args);
    }

    removeAllListeners(): void {
        eventManager.removeAllListeners();
    }

    removeListener(event: string | symbol, listener: (...args: any[]) => void): void {
        eventManager.removeListener(event, listener);
    }
}

import eventManager from './EventManager';

type Listener = (...args: any[]) => void;

export default class EventEmitter {
    private ownListeners: Array<{ event: string | symbol; listener: Listener }> = [];

    addListener(event: string | symbol, listener: Listener): void {
        this.ownListeners.push({ event, listener });
        eventManager.addListener(event, listener);
    }

    emit(event: string | symbol, ...args: any[]): void {
        eventManager.emit(event, ...args);
    }

    removeAllListeners(): void {
        // Shared eventManager: remove only this instance's listeners.
        this.ownListeners.forEach(({ event, listener }) => eventManager.removeListener(event, listener));
        this.ownListeners = [];
    }

    removeListener(event: string | symbol, listener: Listener): void {
        this.ownListeners = this.ownListeners.filter(own => !(own.event === event && own.listener === listener));
        eventManager.removeListener(event, listener);
    }
}

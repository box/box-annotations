import noop from 'lodash/noop';
import EventEmitter from '../EventEmitter';
import eventManager from '../EventManager';

jest.mock('../EventManager');

describe('EventEmitter', () => {
    const emitter = new EventEmitter();

    describe('addListener()', () => {
        test('should proxy addListener to eventManager', () => {
            emitter.addListener('foo', noop);
            expect(eventManager.addListener).toHaveBeenCalledWith('foo', noop);
        });
    });

    describe('emit()', () => {
        test('should proxy emit to eventManager', () => {
            const data = { hello: 'world' };
            emitter.emit('foo', data);
            expect(eventManager.emit).toHaveBeenCalledWith('foo', data);
        });
    });

    describe('removeAllListeners()', () => {
        test('should proxy removeAllListeners to eventManager', () => {
            emitter.removeAllListeners();
            expect(eventManager.removeAllListeners).toHaveBeenCalled();
        });
    });

    describe('removeListener()', () => {
        test('should proxy removeListener to eventManager', () => {
            emitter.removeListener('foo', noop);
            expect(eventManager.removeListener).toHaveBeenCalledWith('foo', noop);
        });
    });
});

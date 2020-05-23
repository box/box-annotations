import { EventEmitter } from 'events';
import { LegacyEvent } from '../../@types';
import eventManager from '../EventManager';

describe('EventManager', () => {
    describe('emit()', () => {
        test('should proxy its event to its base class', () => {
            const emitSpy = jest.spyOn(EventEmitter.prototype, 'emit');
            const mockData = { test: 'data' };
            const result = eventManager.emit('test', mockData);

            expect(emitSpy).toHaveBeenCalledWith('test', mockData);
            expect(emitSpy).toHaveBeenCalledWith(LegacyEvent.ANNOTATOR, { event: 'test', data: mockData });
            expect(result).toBe(true);
        });
    });
});

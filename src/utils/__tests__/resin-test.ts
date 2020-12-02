import noop from 'lodash/noop';
import { applyResinTags, stringify } from '../resin';

describe('resin', () => {
    describe('stringify()', () => {
        test.each`
            value    | expResult
            ${'foo'} | ${'foo'}
            ${false} | ${'false'}
            ${123.4} | ${'123.4'}
            ${123}   | ${'123'}
        `('should convert the value ($value) to a string', ({ value, expResult }) => {
            expect(stringify(value)).toEqual(expResult);
        });

        test.each([{}, [1, 2, 3], noop, null, Symbol('abc')])('should return null for value %s', value => {
            expect(stringify(value)).toBe('');
        });
    });

    describe('applyResinTags()', () => {
        let element = document.createElement('div');
        let setAttributeSpy: jest.SpyInstance;

        beforeEach(() => {
            element = document.createElement('div');
            setAttributeSpy = jest.spyOn(element, 'setAttribute');
        });

        test('should not do anything if there are no attributes', () => {
            applyResinTags(element as HTMLElement, {});
            expect(setAttributeSpy).not.toHaveBeenCalled();
        });

        test('should apply resin tags to element', () => {
            const attributes = {
                foo: 'bar',
                number: 123,
                boolean: true,
            };
            applyResinTags(element as HTMLElement, attributes);

            expect(element.getAttribute('data-resin-foo')).toEqual('bar');
            expect(element.getAttribute('data-resin-number')).toEqual('123');
            expect(element.getAttribute('data-resin-boolean')).toEqual('true');
        });

        test('should convert resin tag to lowercase', () => {
            const attributes = {
                camelCase: 'bar',
            };
            applyResinTags(element as HTMLElement, attributes);

            expect(element.getAttribute('data-resin-camelcase')).toEqual('bar');
        });
    });
});

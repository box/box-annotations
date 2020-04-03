import * as popper from '@popperjs/core';
import createPopper, { defaults } from '../Popper';

describe('Popper', () => {
    const popupEl = document.createElement('div');
    const referenceEl = document.createElement('div');

    describe('createPopper()', () => {
        test('should return a new popper instance based on the parameters provided', () => {
            createPopper(referenceEl, popupEl);

            expect(popper.createPopper).toHaveBeenCalledWith(referenceEl, popupEl, defaults);
        });

        test('should return a new popper with deeply merged options, if provided', () => {
            const { modifiers: defaultModifiers, ...rest } = defaults;
            const modifiers = [{ name: 'event-handlers' }];

            createPopper(referenceEl, popupEl, {
                modifiers,
                placement: 'left',
            });

            expect(popper.createPopper).toHaveBeenCalledWith(referenceEl, popupEl, {
                ...rest,
                placement: 'left',
                modifiers: [...defaultModifiers, ...modifiers],
            });
        });
    });
});

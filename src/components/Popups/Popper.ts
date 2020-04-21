import * as popper from '@popperjs/core';
import mergeWith from 'lodash/mergeWith';
import unionBy from 'lodash/unionBy';

export type Instance = popper.Instance;
export type Options = popper.Options;

export const defaults = {
    modifiers: [
        {
            name: 'arrow',
            options: {
                element: '.ba-Popup-arrow',
                padding: 20,
            },
        },
        {
            name: 'flip',
        },
        {
            name: 'offset',
            options: {
                offset: [0, 15],
            },
        },
    ],
    placement: 'bottom',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const merger = (sourceValue: any, newValue: any): any => {
    if (Array.isArray(sourceValue) && Array.isArray(newValue)) {
        return unionBy(sourceValue, newValue, 'name');
    }

    return undefined; // Default to lodash/merge behavior
};

export default function create(reference: HTMLElement, popup: HTMLElement, options: Partial<Options> = {}): Instance {
    return popper.createPopper(reference, popup, mergeWith({}, defaults, options, merger) as Options);
}

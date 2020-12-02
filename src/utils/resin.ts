const RESIN_PREFIX = 'data-resin-';

export function stringify(value: unknown): string {
    if (typeof value === 'object' || typeof value === 'function') {
        return '';
    }

    return typeof value === 'string' ? value : String(value);
}

export function applyResinTags(element: HTMLElement, attributes: Record<string, unknown>): void {
    if (!element || !Object.values(attributes).length) {
        return;
    }

    Object.entries(attributes).forEach(([key, value]) => {
        const attribute = `${RESIN_PREFIX}${key}`;
        const stringValue = stringify(value);

        if (stringValue) {
            element.setAttribute(attribute, stringValue);
        }
    });
}

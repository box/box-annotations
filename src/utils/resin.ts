const RESIN_PREFIX = 'data-resin-';

export function getResinAttribute(name: string): string {
    return `${RESIN_PREFIX}${name}`;
}

export function stringify(value: unknown): string | null {
    if (typeof value === 'object' || typeof value === 'function') {
        return null;
    }

    return typeof value === 'string' ? value : String(value);
}

export function applyResinTags(element: HTMLElement, attributes: Record<string, unknown>): void {
    if (!element || !Object.values(attributes).length) {
        return;
    }

    Object.entries(attributes).forEach(([key, value]) => {
        const attribute = getResinAttribute(key);
        const stringValue = stringify(value);

        if (attribute && stringValue) {
            element.setAttribute(attribute, stringValue);
        }
    });
}

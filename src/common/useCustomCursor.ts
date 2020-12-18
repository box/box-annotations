import * as React from 'react';

export default function useCustomCursor(
    ref: React.RefObject<HTMLElement> | null,
    cursorTemplate: string,
    color: string,
    offsetX = 0,
    offsetY = 0,
    defaultCursor = 'default',
): void {
    React.useEffect(() => {
        const { current: element } = ref || {};

        if (!element) {
            return;
        }

        let svg = cursorTemplate.replace('{{cursorFillColor}}', color);
        // convert svg to data-uri
        svg = encodeURIComponent(svg.replace(/"/g, "'"));

        Object.assign(element.style, {
            cursor: `url("data:image/svg+xml,${svg}") ${offsetX} ${offsetY}, ${defaultCursor}`,
        });
    }, [color, cursorTemplate, defaultCursor, offsetX, offsetY, ref]);
}

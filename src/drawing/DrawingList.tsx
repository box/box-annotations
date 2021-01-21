import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import DrawingSVG, { DrawingSVGRef } from './DrawingSVG';
import DrawingTarget from './DrawingTarget';
import useIsListInteractive from '../common/useIsListInteractive';
import { AnnotationDrawing } from '../@types';
import { checkValue } from '../utils/util';
import { getShape } from './drawingUtil';

export type Props = {
    activeId?: string | null;
    annotations: AnnotationDrawing[];
    className?: string;
    onSelect?: (annotationId: string | null) => void;
};

export function filterDrawing({ target: { path_groups: pathGroups } }: AnnotationDrawing): boolean {
    return pathGroups.every(({ paths }) =>
        paths.every(({ points }) => points.every(({ x, y }) => checkValue(x) && checkValue(y))),
    );
}

export function isSafari(): boolean {
    const { userAgent } = navigator;
    // In Chrome browser, the agent string contains Safari and Chrome but in Safari there is only Safari
    return userAgent.indexOf('Safari/') > 0 && userAgent.indexOf('Chrome/') < 0;
}

export function sortDrawing({ target: targetA }: AnnotationDrawing, { target: targetB }: AnnotationDrawing): number {
    const { height: heightA, width: widthA } = getShape(targetA.path_groups);
    const { height: heightB, width: widthB } = getShape(targetB.path_groups);

    // If B is smaller, the result is negative.
    // So, A is sorted to an index lower than B, which means A will be rendered first at bottom
    return heightB * widthB - heightA * widthA;
}

export function DrawingList({ activeId = null, annotations, className, onSelect = noop }: Props): JSX.Element {
    const [rootEl, setRootEl] = React.useState<DrawingSVGRef | null>(null);
    const isListening = useIsListInteractive();

    React.useEffect(() => {
        // Safari doesn't repaint the SVG after a new annotation is drawn which
        // results in the lack of a blur on hover of that drawn annotation
        // The fix is to force a repaint by setting display to none and then to block
        if (activeId && isSafari() && rootEl) {
            rootEl.style.display = 'none';
            setTimeout(() => {
                rootEl.style.display = 'block';
            });
        }
    }, [activeId, rootEl]);

    return (
        <DrawingSVG
            ref={setRootEl}
            className={classNames(className, { 'is-listening': isListening })}
            data-resin-component="drawingList"
        >
            {annotations
                .filter(filterDrawing)
                .sort(sortDrawing)
                .map(({ id, target }) => (
                    <DrawingTarget
                        key={id}
                        annotationId={id}
                        isActive={activeId === id}
                        onSelect={onSelect}
                        rootEl={rootEl}
                        target={target}
                    />
                ))}
        </DrawingSVG>
    );
}

export default React.memo(DrawingList);

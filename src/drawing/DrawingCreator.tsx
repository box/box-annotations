import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import * as uuid from 'uuid';
import DrawingPath, { DrawingPathRef, getPathCommands } from './DrawingPath';
import DrawingSVG, { DrawingSVGRef } from './DrawingSVG';
import PointerCapture, { Status as DrawingStatus } from '../components/PointerCapture';
import { getStrokeWidths } from './DrawingPathGroup';
import { PathGroup, Position, Stroke } from '../@types';
import './DrawingCreator.scss';

type Props = {
    className?: string;
    onAbort?: () => void;
    onStart: () => void;
    onStop: (pathGroup: PathGroup) => void;
    stroke?: Stroke;
};

const defaultStroke = {
    color: '#4826c2',
    size: 4,
};

export default function DrawingCreator({
    className,
    onAbort = noop,
    onStart,
    onStop,
    stroke = defaultStroke,
}: Props): JSX.Element {
    const [drawingStatus, setDrawingStatus] = React.useState<DrawingStatus>(DrawingStatus.init);
    const capturedPathRef = React.useRef<Array<Position>>([]);
    const creatorElRef = React.useRef<HTMLDivElement>(null);
    const drawingDirtyRef = React.useRef<boolean>(false);
    const drawingPathRef = React.useRef<DrawingPathRef>(null);
    const drawingSVGRef = React.useRef<DrawingSVGRef>(null);
    const renderHandleRef = React.useRef<number | null>(null);

    const getPathGroup = (): PathGroup | null => {
        const { current: creatorEl } = creatorElRef;
        const { current: points } = capturedPathRef;

        if (!creatorEl || points.length <= 1) {
            return null;
        }

        return {
            clientId: uuid.v4(),
            paths: [{ clientId: uuid.v4(), points }],
            stroke,
        };
    };
    const getPosition = (x: number, y: number): [number, number] => {
        const { current: creatorEl } = creatorElRef;

        if (!creatorEl) {
            return [x, y];
        }

        // Calculate the new position based on the mouse position less the page offset
        // and convert to a percentage of the page
        const { height, left, top, width } = creatorEl.getBoundingClientRect();
        return [((x - left) / width) * 100, ((y - top) / height) * 100];
    };

    // Drawing Lifecycle Callbacks
    const startDraw = (x: number, y: number): void => {
        const [x1, y1] = getPosition(x, y);

        setDrawingStatus(DrawingStatus.dragging);

        capturedPathRef.current = [{ x: x1, y: y1 }];
        drawingDirtyRef.current = true;
    };
    const stopDraw = (): void => {
        const pathGroup = getPathGroup();

        setDrawingStatus(DrawingStatus.init);

        capturedPathRef.current = [];
        drawingDirtyRef.current = true;

        if (pathGroup) {
            onStop(pathGroup);
        } else {
            onAbort();
        }
    };
    const updateDraw = (x: number, y: number): void => {
        const [x2, y2] = getPosition(x, y);
        const { current: points } = capturedPathRef;

        points.push({ x: x2, y: y2 });
        drawingDirtyRef.current = true;

        if (drawingStatus !== DrawingStatus.drawing) {
            setDrawingStatus(DrawingStatus.drawing);
            onStart();
        }
    };

    // Event Handlers
    const renderStep = (callback: () => void): void => {
        renderHandleRef.current = window.requestAnimationFrame(callback);
    };
    const renderPath = (): void => {
        const { current: creatorEl } = creatorElRef;
        const { current: points } = capturedPathRef;
        const { current: isDirty } = drawingDirtyRef;
        const { current: svgPath } = drawingPathRef;

        if (!creatorEl) {
            return;
        }

        const d = getPathCommands(points);

        if (isDirty && svgPath && d.length) {
            svgPath.setAttribute('d', d);

            drawingDirtyRef.current = false;
        }

        renderStep(renderPath);
    };

    React.useEffect(() => {
        if (drawingStatus !== DrawingStatus.init) {
            renderStep(renderPath);
        }

        return () => {
            const { current: renderHandle } = renderHandleRef;

            // Cancel the render loop
            if (renderHandle) {
                window.cancelAnimationFrame(renderHandle);
            }
        };
    }, [drawingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    const { strokeWidth } = getStrokeWidths(stroke.size, drawingSVGRef.current) ?? {};

    return (
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <PointerCapture
            ref={creatorElRef}
            className={classNames(className, 'ba-DrawingCreator')}
            data-testid="ba-DrawingCreator"
            onDrawStart={startDraw}
            onDrawStop={stopDraw}
            onDrawUpdate={updateDraw}
            status={drawingStatus}
        >
            <DrawingSVG ref={drawingSVGRef} className="ba-DrawingCreator-current">
                <g fill="transparent" stroke={stroke.color} strokeWidth={strokeWidth}>
                    {drawingStatus === DrawingStatus.drawing && <DrawingPath ref={drawingPathRef} />}
                </g>
            </DrawingSVG>
        </PointerCapture>
    );
}

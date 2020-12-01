import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { bdlBoxBlue } from 'box-ui-elements/es/styles/variables';
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
    color: bdlBoxBlue,
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

    const getPoints = (): Array<Position> | null => {
        const { current: creatorEl } = creatorElRef;
        const { current: points } = capturedPathRef;

        if (!creatorEl || !points.length) {
            return null;
        }

        const { height, width } = creatorEl.getBoundingClientRect();
        return points.map(({ x, y }) => ({
            x: (x / width) * 100,
            y: (y / height) * 100,
        }));
    };

    const getPathGroup = (): PathGroup | null => {
        const { current: creatorEl } = creatorElRef;
        const { current: points } = capturedPathRef;
        const adjustedPoints = getPoints();

        // If there is only one point in the points array, it is likely the user clicked
        // instead of dragging a path so this is not considered a path group.
        if (!creatorEl || points.length <= 1 || !adjustedPoints) {
            return null;
        }

        return {
            paths: [{ points: adjustedPoints }],
            stroke,
        };
    };
    const getPosition = (x: number, y: number): [number, number] => {
        const { current: creatorEl } = creatorElRef;

        if (!creatorEl) {
            return [x, y];
        }

        // Calculate the new position based on the mouse position less the page offset
        const { left, top } = creatorEl.getBoundingClientRect();
        return [x - left, y - top];
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
        const { current: isDirty } = drawingDirtyRef;
        const { current: points } = capturedPathRef;
        const { current: svgPath } = drawingPathRef;
        const adjustedPoints = getPoints();

        if (isDirty && svgPath && points.length && adjustedPoints) {
            svgPath.setAttribute('d', getPathCommands(adjustedPoints));

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

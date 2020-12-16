import React from 'react';
import classNames from 'classnames';
import { bdlBoxBlue } from 'box-ui-elements/es/styles/variables';
import DrawingPath, { DrawingPathRef } from './DrawingPath';
import DrawingPathGroup from './DrawingPathGroup';
import DrawingSVG, { DrawingSVGRef } from './DrawingSVG';
import PointerCapture, { PointerCaptureRef, Status as DrawingStatus } from '../components/PointerCapture';
import { getPathCommands } from './drawingUtil';
import { PathGroup, Position, Stroke } from '../@types';
import './DrawingCreator.scss';

export type Props = {
    className?: string;
    onStart: () => void;
    onStop: (pathGroup: PathGroup) => void;
    stroke?: Stroke;
};

export const defaultStroke = {
    color: bdlBoxBlue,
    size: 4,
};

export default function DrawingCreator({ className, onStart, onStop, stroke = defaultStroke }: Props): JSX.Element {
    const [drawingStatus, setDrawingStatus] = React.useState<DrawingStatus>(DrawingStatus.init);
    const capturedPointsRef = React.useRef<Array<Position>>([]);
    const creatorElRef = React.useRef<PointerCaptureRef>(null);
    const drawingDirtyRef = React.useRef<boolean>(false);
    const drawingPathRef = React.useRef<DrawingPathRef>(null);
    const drawingSVGRef = React.useRef<DrawingSVGRef>(null);
    const renderHandleRef = React.useRef<number | null>(null);

    const getPoints = (): Array<Position> => {
        const { current: creatorEl } = creatorElRef;
        const { current: points } = capturedPointsRef;

        if (!creatorEl || !points.length) {
            return [];
        }

        const { height, width } = creatorEl.getBoundingClientRect();
        return points.map(({ x, y }) => ({
            x: (x / width) * 100,
            y: (y / height) * 100,
        }));
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

        capturedPointsRef.current = [{ x: x1, y: y1 }];
        drawingDirtyRef.current = true;
    };
    const stopDraw = React.useCallback((): void => {
        const adjustedPoints = getPoints();

        // If there is only one point in the points array, it is likely the user clicked
        // instead of dragging a path so this is not considered a path group.
        if (!adjustedPoints || adjustedPoints.length <= 1) {
            return;
        }

        setDrawingStatus(DrawingStatus.init);

        capturedPointsRef.current = [];
        drawingDirtyRef.current = true;

        onStop({
            paths: [{ points: adjustedPoints }],
            stroke,
        });
    }, [onStop, setDrawingStatus, stroke]);
    const updateDraw = React.useCallback(
        (x: number, y: number): void => {
            const [x2, y2] = getPosition(x, y);
            const { current: points } = capturedPointsRef;

            points.push({ x: x2, y: y2 });
            drawingDirtyRef.current = true;

            if (drawingStatus !== DrawingStatus.drawing) {
                setDrawingStatus(DrawingStatus.drawing);
                onStart();
            }
        },
        [drawingStatus, onStart, setDrawingStatus],
    );

    // Event Handlers
    const renderStep = (callback: () => void): void => {
        renderHandleRef.current = window.requestAnimationFrame(callback);
    };
    const renderPath = (): void => {
        const { current: isDirty } = drawingDirtyRef;
        const { current: svgPath } = drawingPathRef;

        if (isDirty && svgPath) {
            svgPath.setAttribute('d', getPathCommands(getPoints()));

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
            {drawingStatus !== DrawingStatus.init && (
                <DrawingSVG ref={drawingSVGRef} className="ba-DrawingCreator-current">
                    <DrawingPathGroup rootEl={drawingSVGRef.current} stroke={stroke}>
                        <DrawingPath ref={drawingPathRef} />
                    </DrawingPathGroup>
                </DrawingSVG>
            )}
        </PointerCapture>
    );
}

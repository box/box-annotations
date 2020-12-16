import * as React from 'react';
import classNames from 'classnames';
import PointerCapture, { Status as DrawingStatus } from '../components/PointerCapture';
import PopupCursor from '../components/Popups/PopupCursor';
import RegionRect, { RegionRectRef } from './RegionRect';
import useAutoScroll from '../common/useAutoScroll';
import { Rect } from '../@types';
import { styleShape } from './regionUtil';
import './RegionCreator.scss';

type Props = {
    className?: string;
    onAbort: () => void;
    onStart: () => void;
    onStop: (shape: Rect) => void;
};

const MIN_X = 0; // Minimum region x position must be positive
const MIN_Y = 0; // Minimum region y position must be positive
const MIN_SIZE = 10; // Minimum region size must be large enough to be clickable

const isValid = (x1: number, y1: number, x2: number, y2: number): boolean =>
    Math.abs(x2 - x1) >= MIN_SIZE || Math.abs(y2 - y1) >= MIN_SIZE;

export default function RegionCreator({ className, onAbort, onStart, onStop }: Props): JSX.Element {
    const [drawingStatus, setDrawingStatus] = React.useState<DrawingStatus>(DrawingStatus.init);
    const [isHovering, setIsHovering] = React.useState<boolean>(false);
    const creatorElRef = React.useRef<HTMLDivElement>(null);
    const positionX1Ref = React.useRef<number | null>(null);
    const positionX2Ref = React.useRef<number | null>(null);
    const positionY1Ref = React.useRef<number | null>(null);
    const positionY2Ref = React.useRef<number | null>(null);
    const regionDirtyRef = React.useRef<boolean>(false);
    const regionRectRef = React.useRef<RegionRectRef>(null);
    const renderHandleRef = React.useRef<number | null>(null);

    // Drawing Helpers
    const getPosition = React.useCallback(
        (x: number, y: number): [number, number] => {
            const { current: creatorEl } = creatorElRef;

            if (!creatorEl) {
                return [x, y];
            }

            // Calculate the new position based on the mouse position less the page offset
            const { left, top } = creatorEl.getBoundingClientRect();
            return [x - left, y - top];
        },
        [creatorElRef],
    );
    const getShape = React.useCallback((): Rect | null => {
        const { current: creatorEl } = creatorElRef;
        const { current: x1 } = positionX1Ref;
        const { current: y1 } = positionY1Ref;
        const { current: x2 } = positionX2Ref;
        const { current: y2 } = positionY2Ref;

        if (!creatorEl || x1 === null || x2 === null || y1 === null || y2 === null) {
            return null;
        }

        const { height, width } = creatorEl.getBoundingClientRect();
        const MAX_HEIGHT = height - MIN_SIZE;
        const MAX_WIDTH = width - MIN_SIZE;
        const MAX_X = Math.max(0, width - MIN_X);
        const MAX_Y = Math.max(0, height - MIN_Y);

        // Add a buffer to the origin to avoid exceeding the dimensions of the page
        const initialX = x1 >= MAX_WIDTH && x2 >= MAX_WIDTH ? x1 - MIN_SIZE : x1;
        const initialY = y1 >= MAX_HEIGHT && y2 >= MAX_HEIGHT ? y1 - MIN_SIZE : y1;

        // Set the origin to the lowest value and the target to the highest to avoid negative height/width
        const originX = Math.min(Math.max(MIN_X, initialX < x2 ? initialX : x2), MAX_X);
        const originY = Math.min(Math.max(MIN_Y, initialY < y2 ? initialY : y2), MAX_Y);
        const targetX = Math.min(Math.max(MIN_X, x2 > initialX ? x2 : initialX), MAX_X);
        const targetY = Math.min(Math.max(MIN_Y, y2 > initialY ? y2 : initialY), MAX_Y);

        // Derive the shape height/width from the two coordinates
        const shapeHeight = Math.max(MIN_SIZE, targetY - originY);
        const shapeWidth = Math.max(MIN_SIZE, targetX - originX);

        return {
            height: (shapeHeight / height) * 100,
            type: 'rect',
            width: (shapeWidth / width) * 100,
            x: (originX / width) * 100,
            y: (originY / height) * 100,
        };
    }, [creatorElRef, positionX1Ref, positionY1Ref, positionX2Ref, positionY2Ref]);

    // Drawing Lifecycle Callbacks
    const startDraw = React.useCallback(
        (x: number, y: number): void => {
            const [x1, y1] = getPosition(x, y);

            setDrawingStatus(DrawingStatus.dragging);

            positionX1Ref.current = x1;
            positionY1Ref.current = y1;
            positionX2Ref.current = null;
            positionY2Ref.current = null;
            regionDirtyRef.current = true;
        },
        [getPosition, setDrawingStatus],
    );
    const stopDraw = React.useCallback((): void => {
        const shape = getShape();

        setDrawingStatus(DrawingStatus.init);

        positionX1Ref.current = null;
        positionY1Ref.current = null;
        positionX2Ref.current = null;
        positionY2Ref.current = null;
        regionDirtyRef.current = true;

        if (shape) {
            onStop(shape);
        } else {
            onAbort();
        }
    }, [
        getShape,
        onAbort,
        onStop,
        positionX1Ref,
        positionY1Ref,
        positionX2Ref,
        positionY2Ref,
        regionDirtyRef,
        setDrawingStatus,
    ]);

    const updateDraw = React.useCallback(
        (x: number, y: number): void => {
            const [x2, y2] = getPosition(x, y);
            const { current: x1 } = positionX1Ref;
            const { current: y1 } = positionY1Ref;
            const { current: prevX2 } = positionX2Ref;

            // Suppress the creation of a small region if the intention of the user is to click on the document
            if (prevX2 === null && !isValid(x1 ?? 0, y1 ?? 0, x2, y2)) {
                return;
            }

            positionX2Ref.current = x2;
            positionY2Ref.current = y2;
            regionDirtyRef.current = true;

            if (drawingStatus !== DrawingStatus.drawing) {
                setDrawingStatus(DrawingStatus.drawing);
                onStart();
            }
        },
        [drawingStatus, getPosition, onStart, positionX1Ref, positionY1Ref, positionX2Ref, setDrawingStatus],
    );

    // Event Handlers
    const handleMouseOut = React.useCallback((): void => {
        setIsHovering(false);
    }, [setIsHovering]);
    const handleMouseOver = React.useCallback((): void => {
        setIsHovering(true);
    }, [setIsHovering]);
    const handleScroll = (x: number, y: number): void => {
        updateDraw(x, y);
    };

    const renderStep = (callback: () => void): void => {
        renderHandleRef.current = window.requestAnimationFrame(callback);
    };
    const renderRect = (): void => {
        const { current: isDirty } = regionDirtyRef;
        const { current: regionRect } = regionRectRef;
        const shape = getShape();

        if (isDirty && regionRect && shape) {
            // Directly set the style attribute
            Object.assign(regionRect.style, styleShape(shape));

            // Reset the dirty state to avoid multiple renders
            regionDirtyRef.current = false;
        }

        renderStep(renderRect);
    };

    React.useEffect(() => {
        if (drawingStatus !== DrawingStatus.init) {
            renderStep(renderRect);
        }

        return () => {
            const { current: renderHandle } = renderHandleRef;

            // Cancel the render loop
            if (renderHandle) {
                window.cancelAnimationFrame(renderHandle);
            }
        };
    }, [drawingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    useAutoScroll({
        enabled: drawingStatus !== DrawingStatus.init,
        onScroll: handleScroll,
        reference: creatorElRef.current,
    });

    return (
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <PointerCapture
            ref={creatorElRef}
            className={classNames(className, 'ba-RegionCreator')}
            data-testid="ba-RegionCreator"
            onDrawStart={startDraw}
            onDrawStop={stopDraw}
            onDrawUpdate={updateDraw}
            onMouseOut={handleMouseOut}
            onMouseOver={handleMouseOver}
            status={drawingStatus}
        >
            {drawingStatus === DrawingStatus.drawing && (
                <RegionRect ref={regionRectRef} className="ba-RegionCreator-rect" isActive />
            )}
            {drawingStatus === DrawingStatus.init && isHovering && <PopupCursor />}
        </PointerCapture>
    );
}

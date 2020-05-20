import * as React from 'react';
import classNames from 'classnames';
import RegionRect from './RegionRect';
import useAutoScroll from '../common/useAutoScroll';
import { Rect } from '../@types';
import './RegionCreator.scss';

type Props = {
    canDraw: boolean;
    className?: string;
    onStart: () => void;
    onStop: (shape: Rect) => void;
};

const MIN_X = 1; // Minimum region x position must be positive
const MIN_Y = 1; // Minimum region y position must be positive
const MIN_SIZE = 10; // Minimum region size must be large enough to be clickable
const MOUSE_PRIMARY = 1; // Primary mouse button

export default function RegionCreator({ canDraw, className, onStart, onStop }: Props): JSX.Element {
    const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
    const creatorSvgRef = React.useRef<SVGSVGElement | null>(null);
    const positionX1Ref = React.useRef<number | null>(null);
    const positionX2Ref = React.useRef<number | null>(null);
    const positionY1Ref = React.useRef<number | null>(null);
    const positionY2Ref = React.useRef<number | null>(null);
    const regionDirtyRef = React.useRef<boolean>(false);
    const regionRectRef = React.useRef<SVGRectElement | null>(null);
    const renderHandleRef = React.useRef<number | null>(null);

    // Drawing Helpers
    const getPosition = (x: number, y: number): [number, number] => {
        const { current: creatorRef } = creatorSvgRef;

        if (!creatorRef) {
            return [x, y];
        }

        // Calculate the new position based on the mouse position less the page offset
        const { left, top } = creatorRef.getBoundingClientRect();
        return [x - left, y - top];
    };
    const getShape = (): Rect | null => {
        const { current: creatorRef } = creatorSvgRef;
        const { current: x1 } = positionX1Ref;
        const { current: y1 } = positionY1Ref;
        const { current: x2 } = positionX2Ref;
        const { current: y2 } = positionY2Ref;

        if (!creatorRef || !x1 || !x2 || !y1 || !y2) {
            return null;
        }

        const { height, width } = creatorRef.getBoundingClientRect();
        const MAX_X = Math.max(0, width - MIN_X);
        const MAX_Y = Math.max(0, height - MIN_Y);

        // Set the origin x/y to the lowest value and the target x/y to the highest to avoid negative height/width
        const originX = Math.min(Math.max(MIN_X, x1 < x2 ? x1 : x2), MAX_X);
        const originY = Math.min(Math.max(MIN_Y, y1 < y2 ? y1 : y2), MAX_Y);
        const targetX = Math.min(Math.max(MIN_X, x2 > x1 ? x2 : x1), MAX_X);
        const targetY = Math.min(Math.max(MIN_Y, y2 > y1 ? y2 : y1), MAX_Y);

        return {
            height: Math.max(MIN_SIZE, targetY - originY),
            type: 'rect',
            width: Math.max(MIN_SIZE, targetX - originX),
            x: originX,
            y: originY,
        };
    };

    // Drawing Lifecycle Callbacks
    const startDraw = (x: number, y: number): void => {
        const [x1, y1] = getPosition(x, y);

        setIsDrawing(true);

        positionX1Ref.current = x1;
        positionY1Ref.current = y1;
        positionX2Ref.current = null;
        positionY2Ref.current = null;
        regionDirtyRef.current = true;

        onStart();
    };
    const stopDraw = (): void => {
        const shape = getShape();

        setIsDrawing(false);

        positionX1Ref.current = null;
        positionY1Ref.current = null;
        positionX2Ref.current = null;
        positionY2Ref.current = null;
        regionDirtyRef.current = true;

        if (shape) {
            onStop(shape);
        }
    };
    const updateDraw = (x: number, y: number): void => {
        const [x2, y2] = getPosition(x, y);

        positionX2Ref.current = x2;
        positionY2Ref.current = y2;
        regionDirtyRef.current = true;
    };

    // Event Handlers
    const handleClick = (event: React.MouseEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };
    const handleMouseDown = ({ buttons, clientX, clientY }: React.MouseEvent): void => {
        if (buttons !== MOUSE_PRIMARY) {
            return;
        }

        startDraw(clientX, clientY);
    };
    const handleMouseMove = ({ buttons, clientX, clientY }: MouseEvent): void => {
        if (buttons !== MOUSE_PRIMARY || !isDrawing) {
            return;
        }

        updateDraw(clientX, clientY);
    };
    const handleMouseUp = (): void => {
        stopDraw();
    };
    const handleScroll = (x: number, y: number): void => {
        updateDraw(x, y);
    };
    const handleTouchCancel = (): void => {
        stopDraw();
    };
    const handleTouchEnd = (): void => {
        stopDraw();
    };
    const handleTouchMove = ({ targetTouches }: React.TouchEvent): void => {
        updateDraw(targetTouches[0].clientX, targetTouches[0].clientY);
    };
    const handleTouchStart = ({ targetTouches }: React.TouchEvent): void => {
        startDraw(targetTouches[0].clientX, targetTouches[0].clientY);
    };
    const eventHandlers = canDraw
        ? {
              onClick: handleClick,
              onMouseDown: handleMouseDown,
              onTouchCancel: handleTouchCancel,
              onTouchEnd: handleTouchEnd,
              onTouchMove: handleTouchMove,
              onTouchStart: handleTouchStart,
          }
        : {};

    const renderStep = (callback: () => void): void => {
        renderHandleRef.current = window.requestAnimationFrame(callback);
    };
    const renderRect = (): void => {
        const { current: isDirty } = regionDirtyRef;
        const { current: regionRect } = regionRectRef;
        const { height = 0, width = 0, x = 0, y = 0 } = getShape() || {};

        if (regionRect && isDirty) {
            regionRect.setAttribute('height', `${height}`);
            regionRect.setAttribute('width', `${width}`);
            regionRect.setAttribute('x', `${x}`);
            regionRect.setAttribute('y', `${y}`);
            regionDirtyRef.current = false;
        }

        renderStep(renderRect);
    };

    React.useEffect(() => {
        // Document-level mousemove and mouseup event listeners allow the creator component to respond even if
        // the cursor leaves the drawing area before the mouse button is released, which finishes the shape
        if (isDrawing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            renderStep(renderRect);
        }

        return () => {
            const { current: renderHandle } = renderHandleRef;

            // Cancel the render loop
            if (renderHandle) {
                window.cancelAnimationFrame(renderHandle);
            }

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDrawing]); // eslint-disable-line react-hooks/exhaustive-deps

    useAutoScroll({
        enabled: isDrawing,
        onScroll: handleScroll,
        reference: creatorSvgRef.current,
    });

    return (
        <svg
            ref={creatorSvgRef}
            className={classNames(className, 'ba-RegionCreator', { 'is-active': canDraw })}
            data-testid="ba-RegionCreator"
            {...eventHandlers}
        >
            {isDrawing && <RegionRect ref={regionRectRef} />}
        </svg>
    );
}

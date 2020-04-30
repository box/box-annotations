import * as React from 'react';
import classNames from 'classnames';
import AutoScroller from '../components/AutoScroller';
import RegionRect from './RegionRect';
import { Rect } from '../@types';
import './RegionCreator.scss';

type Position = {
    x: number;
    y: number;
};

type Props = {
    canDraw: boolean;
    className?: string;
    onStart: () => void;
    onStop: (shape: Rect) => void;
};

type State = {
    isDrawing: boolean;
    position1: Position | null;
    position2: Position | null;
};

const MIN_X = 1; // Minimum region x position must be positive
const MIN_Y = 1; // Minimum region y position must be positive
const MIN_SIZE = 10; // Minimum region size must be large enough to be clickable
const MOUSE_PRIMARY = 1; // Primary mouse button

export default class RegionCreator extends React.Component<Props, State> {
    creatorRef: React.RefObject<SVGSVGElement> = React.createRef();

    state: State = {
        isDrawing: false,
        position1: null,
        position2: null,
    };

    componentWillUnmount(): void {
        this.removeListeners();
    }

    getPosition({ x, y }: Position): Position {
        const { current: creatorRef } = this.creatorRef;

        if (!creatorRef) {
            return { x, y };
        }

        // Calculate the new position based on the mouse position less the page offset
        const { left, top } = creatorRef.getBoundingClientRect();
        return { x: x - left, y: y - top };
    }

    getShape(): Rect | null {
        const { current: creatorRef } = this.creatorRef;
        const { position1, position2 } = this.state;

        if (!creatorRef || !position1 || !position2) {
            return null;
        }

        const { height, width } = creatorRef.getBoundingClientRect();
        const MAX_X = Math.max(0, width - MIN_X);
        const MAX_Y = Math.max(0, height - MIN_Y);

        // Get the first position from mousedown and the second position from mousemove
        const { x: x1, y: y1 } = position1;
        const { x: x2, y: y2 } = position2;

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
    }

    handleClick = (event: React.MouseEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    handleMouseDown = ({ buttons, clientX, clientY }: React.MouseEvent): void => {
        if (buttons !== MOUSE_PRIMARY) {
            return;
        }

        this.startDraw({
            x: clientX,
            y: clientY,
        });
    };

    handleMouseMove = ({ buttons, clientX, clientY }: MouseEvent): void => {
        const { isDrawing } = this.state;

        if (buttons !== MOUSE_PRIMARY || !isDrawing) {
            return;
        }

        this.updateDraw({
            x: clientX,
            y: clientY,
        });
    };

    handleMouseUp = (): void => {
        this.stopDraw();
    };

    handleScroll = (position: Position): void => {
        this.updateDraw(position);
    };

    handleTouchCancel = (): void => {
        this.stopDraw();
    };

    handleTouchEnd = (): void => {
        this.stopDraw();
    };

    handleTouchMove = ({ targetTouches }: React.TouchEvent): void => {
        this.updateDraw({
            x: targetTouches[0].clientX,
            y: targetTouches[0].clientY,
        });
    };

    handleTouchStart = ({ targetTouches }: React.TouchEvent): void => {
        this.startDraw({
            x: targetTouches[0].clientX,
            y: targetTouches[0].clientY,
        });
    };

    addListeners(): void {
        // Document-level mousemove and mouseup event listeners allow the creator component to respond even if
        // the cursor leaves the drawing area before the mouse button is released, which finishes the shape
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    removeListeners(): void {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    startDraw(position: Position): void {
        const { onStart } = this.props;

        this.addListeners();
        this.setState({
            isDrawing: true,
            position1: this.getPosition(position),
            position2: null,
        });

        onStart();
    }

    stopDraw(): void {
        const { onStop } = this.props;
        const shape = this.getShape();

        this.removeListeners();
        this.setState({
            isDrawing: false,
            position1: null,
            position2: null,
        });

        if (shape) {
            onStop(shape);
        }
    }

    updateDraw({ x, y }: Position): void {
        this.setState({ position2: this.getPosition({ x, y }) });
    }

    render(): JSX.Element {
        const { canDraw, className } = this.props;
        const { isDrawing } = this.state;
        const eventHandlers = canDraw
            ? {
                  onClick: this.handleClick,
                  onMouseDown: this.handleMouseDown,
                  onTouchCancel: this.handleTouchCancel,
                  onTouchEnd: this.handleTouchEnd,
                  onTouchMove: this.handleTouchMove,
                  onTouchStart: this.handleTouchStart,
              }
            : {};

        return (
            <AutoScroller
                ref={this.creatorRef}
                as="svg"
                className={classNames(className, 'ba-RegionCreator', { 'is-active': canDraw })}
                enabled={isDrawing}
                onScroll={this.handleScroll}
                {...eventHandlers}
            >
                <RegionRect shape={this.getShape()} />
            </AutoScroller>
        );
    }
}

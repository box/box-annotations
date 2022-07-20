import * as React from 'react';
import { bdlYellow, black, white } from 'box-ui-elements/es/styles/variables';
import { Rect } from '../@types';
import './HighlightCanvas.scss';

export type CanvasShape = Rect & { isActive?: boolean; isHover?: boolean };

export type Props = {
    shapes: CanvasShape[] | CanvasShape;
};

export default class HighlightCanvas extends React.PureComponent<Props> {
    static defaultProps = {
        shapes: [],
    };

    canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

    componentDidMount(): void {
        this.scaleCanvas();
        this.renderRects();
    }

    componentDidUpdate(): void {
        this.clearCanvas();
        this.renderRects();
    }

    getContext(): CanvasRenderingContext2D | null {
        const { current: canvasRef } = this.canvasRef;
        return canvasRef?.getContext('2d') ?? null;
    }

    scaleCanvas(): void {
        const { current: canvasRef } = this.canvasRef;

        if (!canvasRef) {
            return;
        }

        canvasRef.width = canvasRef.offsetWidth;
        canvasRef.height = canvasRef.offsetHeight;
    }

    clearCanvas(): void {
        const { current: canvasRef } = this.canvasRef;
        const context = canvasRef && canvasRef.getContext('2d');

        if (!canvasRef || !context) {
            return;
        }

        context.clearRect(0, 0, canvasRef.width, canvasRef.height);
    }

    renderRects(): void {
        const { shapes } = this.props;
        const { current: canvasRef } = this.canvasRef;
        const context = canvasRef && canvasRef.getContext('2d');
        const canvasHeight = canvasRef?.height ?? 0;
        const canvasWidth = canvasRef?.width ?? 0;
        const shapesArray = Array.isArray(shapes) ? shapes : [shapes];

        if (!context) {
            return;
        }

        shapesArray.forEach(rect => {
            const { height, isActive, isHover, width, x, y } = rect;

            // Ignore empty rects with a width or height of 0
            if (width === 0 || height === 0) {
                return;
            }

            const rectHeight = (height / 100) * canvasHeight;
            const rectWidth = (width / 100) * canvasWidth;
            const x1 = (x / 100) * canvasWidth;
            const y1 = (y / 100) * canvasHeight;

            context.save();

            // Draw the highlight rect
            context.fillStyle = bdlYellow;
            context.globalAlpha = isActive || isHover ? 0.66 : 0.33;
            context.fillRect(x1, y1, rectWidth, rectHeight);
            context.restore();
            context.save();

            // Draw the white border
            context.strokeStyle = white;
            context.lineWidth = 1;
            context.strokeRect(x1, y1, rectWidth, rectHeight);

            // If annotation is active, apply a shadow
            if (isActive) {
                const imgData = context.getImageData(x1, y1, rectWidth, rectHeight);

                context.save();
                context.shadowColor = black;
                context.shadowBlur = 10;

                context.strokeRect(x1, y1, rectWidth, rectHeight);
                context.putImageData(imgData, x1, y1);
                context.restore();
            }

            context.restore();
        });
    }

    render(): JSX.Element {
        return <canvas ref={this.canvasRef} className="ba-HighlightCanvas" />;
    }
}

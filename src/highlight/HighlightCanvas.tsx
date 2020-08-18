import * as React from 'react';
import { bdlYellorange, black, white } from 'box-ui-elements/es/styles/variables';
import { Rect } from '../@types';
import './HighlightCanvas.scss';

export type CanvasShape = Rect & { isActive?: boolean };

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

    roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius = 5,
        fill = false,
        stroke = true,
    ): void {
        const radii = { tl: radius, tr: radius, br: radius, bl: radius };
        ctx.beginPath();
        ctx.moveTo(x + radii.tl, y);
        ctx.lineTo(x + width - radii.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radii.tr);
        ctx.lineTo(x + width, y + height - radii.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radii.br, y + height);
        ctx.lineTo(x + radii.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radii.bl);
        ctx.lineTo(x, y + radii.tl);
        ctx.quadraticCurveTo(x, y, x + radii.tl, y);
        ctx.closePath();

        if (fill) {
            ctx.fill();
        }

        if (stroke) {
            ctx.stroke();
        }
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
            const { height, isActive, width, x, y } = rect;
            const rectHeight = (height / 100) * canvasHeight;
            const rectWidth = (width / 100) * canvasWidth;
            const x1 = (x / 100) * canvasWidth;
            const y1 = (y / 100) * canvasHeight;

            context.save();

            // Draw the highlight rect
            context.fillStyle = bdlYellorange;
            context.globalAlpha = isActive ? 0.66 : 0.33;
            this.roundRect(context, x1, y1, rectWidth, rectHeight, 5, true, false);
            context.restore();
            context.save();

            // Draw the white border
            context.strokeStyle = white;
            context.lineWidth = 1;
            this.roundRect(context, x1, y1, rectWidth, rectHeight, 5, false, true);

            // If annotation is active, apply a shadow
            if (isActive) {
                const imgData = context.getImageData(x1 - 1, y1 - 1, rectWidth + 2, rectHeight + 2);

                context.save();
                context.shadowColor = black;
                context.shadowBlur = 10;

                this.roundRect(context, x1, y1, rectWidth, rectHeight, 5, false, true);
                context.putImageData(imgData, x1 - 1, y1 - 1);
                context.restore();
            }

            context.restore();
        });
    }

    render(): JSX.Element {
        return <canvas ref={this.canvasRef} className="ba-HighlightCanvas" />;
    }
}

import merge from 'lodash/merge';
import * as React from 'react';
import PopupReply from '../components/Popups/PopupReply';
import RegionAnnotation from './RegionAnnotation';
import RegionCreator from './RegionCreator';
import { Annotation, Rect, TargetRegion } from '../@types';
import { CreatorItem, CreatorStatus } from '../store/creator';
import './RegionAnnotations.scss';

type Props = {
    activeAnnotationId: string | null;
    annotations: Annotation[];
    createRegion: (arg: { location: number; message: string; shape: Rect }) => void;
    isCreating: boolean;
    page: number;
    scale: number;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setStaged: (staged: CreatorItem | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorItem | null;
    status: CreatorStatus;
};

type State = {
    targetRef?: HTMLAnchorElement;
};

export default class RegionAnnotations extends React.Component<Props, State> {
    static defaultProps = {
        annotations: [],
        isCreating: false,
        scale: 1,
    };

    state: State = {};

    setStaged(data: Partial<CreatorItem> | null): void {
        const { page, setStaged, staged } = this.props;
        setStaged(data ? merge({ location: page, message: '' }, staged, data) : data);
    }

    setStatus(status: CreatorStatus): void {
        const { setStatus } = this.props;
        setStatus(status);
    }

    handleAnnotationActive = (annotationId: string): void => {
        const { setActiveAnnotationId } = this.props;

        setActiveAnnotationId(annotationId);
    };

    handleCancel = (): void => {
        this.setStaged(null);
        this.setStatus(CreatorStatus.init);
    };

    handleChange = (text?: string): void => {
        this.setStaged({ message: text });
    };

    handleDraw = (rawShape: Rect): void => {
        const { staged } = this.props;
        const newShape = this.scaleShape(rawShape, true);
        const prevShape = staged && staged.shape;

        if (
            prevShape &&
            prevShape.height === newShape.height &&
            prevShape.width === newShape.width &&
            prevShape.x === newShape.x &&
            prevShape.y === newShape.y
        ) {
            return;
        }

        this.setStaged({ shape: newShape }); // Store at a scale of 1
    };

    handleStart = (): void => {
        this.setStatus(CreatorStatus.init);
    };

    handleStop = (): void => {
        this.setStatus(CreatorStatus.staged);
    };

    handleSubmit = (): void => {
        const { createRegion, staged } = this.props;

        if (!staged) {
            return;
        }

        createRegion(staged);
    };

    setTargetRef = (targetRef: HTMLAnchorElement): void => {
        this.setState({ targetRef });
    };

    scaleShape({ height, width, x, y, ...rest }: Rect, invert = false): Rect {
        const { scale } = this.props;
        const ratio = invert ? 1 / scale : scale;

        return {
            ...rest,
            height: height * ratio,
            width: width * ratio,
            x: x * ratio,
            y: y * ratio,
        };
    }

    render(): JSX.Element {
        const { activeAnnotationId, annotations, isCreating, staged, status } = this.props;
        const { targetRef } = this.state;
        const canDraw = !staged || !staged.message;
        const canReply = status === CreatorStatus.staged;

        return (
            <>
                {/* Layer 1: Saved annotations */}
                <svg className="ba-RegionAnnotations-list">
                    {annotations.map(({ id, target }) => (
                        <RegionAnnotation
                            key={id}
                            annotationId={id}
                            isActive={!isCreating && activeAnnotationId === id}
                            onSelect={this.handleAnnotationActive}
                            shape={this.scaleShape((target as TargetRegion).shape)}
                        />
                    ))}
                </svg>

                {/* Layer 2: Transparent layer to handle click/drag events */}
                {isCreating && (
                    <RegionCreator
                        canDraw={canDraw}
                        className="ba-RegionAnnotations-creator"
                        onDraw={this.handleDraw}
                        onStart={this.handleStart}
                        onStop={this.handleStop}
                    />
                )}

                {/* Layer 3a: New, unsaved annotation target, if any */}
                {isCreating && staged && (
                    <svg className="ba-RegionAnnotations-target">
                        <RegionAnnotation
                            ref={this.setTargetRef}
                            annotationId="staged"
                            isActive
                            shape={this.scaleShape(staged.shape)}
                        />
                    </svg>
                )}

                {/* Layer 3b: New, unsaved annotation description popup, if 3a is ready */}
                {isCreating && staged && canReply && targetRef && (
                    <div className="ba-RegionAnnotations-popup">
                        <PopupReply
                            defaultValue={staged.message}
                            onCancel={this.handleCancel}
                            onChange={this.handleChange}
                            onSubmit={this.handleSubmit}
                            reference={targetRef}
                        />
                    </div>
                )}
            </>
        );
    }
}

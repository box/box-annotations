import merge from 'lodash/merge';
import * as React from 'react';
import PopupReply from '../components/Popups/PopupReply';
import RegionCreator from './RegionCreator';
import RegionList from './RegionList';
import RegionRect from './RegionRect';
import { AnnotationRegion, Rect } from '../@types';
import { CreatorItem, CreatorStatus } from '../store/creator';
import { scaleShape } from './regionUtil';
import './RegionAnnotations.scss';

type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
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
    rectRef?: SVGRectElement;
};

export default class RegionAnnotations extends React.PureComponent<Props, State> {
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

    handleAnnotationActive = (annotationId: string | null): void => {
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

    handleStart = (): void => {
        this.setStaged(null);
        this.setStatus(CreatorStatus.init);
    };

    handleStop = (shape: Rect): void => {
        const { scale } = this.props;

        this.setStaged({ shape: scaleShape(shape, scale, true) });
        this.setStatus(CreatorStatus.staged);
    };

    handleSubmit = (): void => {
        const { createRegion, staged } = this.props;

        if (!staged) {
            return;
        }

        createRegion(staged);
    };

    setRectRef = (rectRef: SVGRectElement): void => {
        this.setState({ rectRef });
    };

    render(): JSX.Element {
        const { activeAnnotationId, annotations, isCreating, scale, staged, status } = this.props;
        const { rectRef } = this.state;
        const canDraw = !staged || !staged.message;
        const canReply = status !== CreatorStatus.init;
        const isPending = status === CreatorStatus.pending;

        return (
            <>
                {/* Layer 1: Saved annotations */}
                <RegionList
                    activeId={isCreating ? null : activeAnnotationId}
                    annotations={annotations}
                    className="ba-RegionAnnotations-list"
                    onSelect={this.handleAnnotationActive}
                    scale={scale}
                />

                {/* Layer 2: Drawn (unsaved) incomplete annotation target, if any */}
                {isCreating && (
                    <RegionCreator
                        canDraw={canDraw}
                        className="ba-RegionAnnotations-creator"
                        onStart={this.handleStart}
                        onStop={this.handleStop}
                    />
                )}

                {/* Layer 3a: Staged (unsaved) annotation target, if any */}
                {isCreating && staged && (
                    <svg className="ba-RegionAnnotations-target">
                        <RegionRect ref={this.setRectRef} shape={scaleShape(staged.shape, scale)} />
                    </svg>
                )}

                {/* Layer 3b: Staged (unsaved) annotation description popup, if 3a is ready */}
                {isCreating && staged && canReply && rectRef && (
                    <div className="ba-RegionAnnotations-popup">
                        <PopupReply
                            isPending={isPending}
                            onCancel={this.handleCancel}
                            onChange={this.handleChange}
                            onSubmit={this.handleSubmit}
                            reference={rectRef}
                            value={staged.message}
                        />
                    </div>
                )}
            </>
        );
    }
}

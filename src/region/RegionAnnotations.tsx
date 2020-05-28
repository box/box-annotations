import * as React from 'react';
import PopupReply from '../components/Popups/PopupReply';
import RegionCreator from './RegionCreator';
import RegionList from './RegionList';
import RegionRect, { RegionRectRef } from './RegionRect';
import { AnnotationRegion, Rect } from '../@types';
import { CreateArg } from './actions';
import { CreatorItem, CreatorStatus } from '../store/creator';
import './RegionAnnotations.scss';

type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    createRegion: (arg: CreateArg) => void;
    isCreating: boolean;
    message: string;
    page: number;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setMessage: (message: string) => void;
    setStaged: (staged: CreatorItem | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorItem | null;
    status: CreatorStatus;
};

type State = {
    rectRef?: RegionRectRef;
};

export default class RegionAnnotations extends React.PureComponent<Props, State> {
    static defaultProps = {
        annotations: [],
        isCreating: false,
    };

    state: State = {};

    handleAnnotationActive = (annotationId: string | null): void => {
        const { setActiveAnnotationId } = this.props;

        setActiveAnnotationId(annotationId);
    };

    handleCancel = (): void => {
        const { setMessage, setStaged, setStatus } = this.props;
        setMessage('');
        setStaged(null);
        setStatus(CreatorStatus.init);
    };

    handleChange = (text?: string): void => {
        const { setMessage } = this.props;
        setMessage(text || '');
    };

    handleStart = (): void => {
        const { setStaged, setStatus } = this.props;
        setStaged(null);
        setStatus(CreatorStatus.init);
    };

    handleStop = (shape: Rect): void => {
        const { page, setStaged, setStatus } = this.props;
        setStaged({ location: page, shape });
        setStatus(CreatorStatus.staged);
    };

    handleSubmit = (): void => {
        const { createRegion, message, staged } = this.props;

        if (!staged) {
            return;
        }

        createRegion({ ...staged, message });
    };

    setRectRef = (rectRef: RegionRectRef): void => {
        this.setState({ rectRef });
    };

    render(): JSX.Element {
        const { activeAnnotationId, annotations, isCreating, message, staged, status } = this.props;
        const { rectRef } = this.state;
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
                />

                {/* Layer 2: Drawn (unsaved) incomplete annotation target, if any */}
                {isCreating && (
                    <RegionCreator
                        className="ba-RegionAnnotations-creator"
                        onStart={this.handleStart}
                        onStop={this.handleStop}
                    />
                )}

                {/* Layer 3a: Staged (unsaved) annotation target, if any */}
                {isCreating && staged && (
                    <div className="ba-RegionAnnotations-target">
                        <RegionRect ref={this.setRectRef} isActive shape={staged.shape} />
                    </div>
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
                            value={message}
                        />
                    </div>
                )}
            </>
        );
    }
}

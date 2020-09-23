import * as React from 'react';
import classNames from 'classnames';
import PopupReply from '../components/Popups/PopupReply';
import RegionCreator from './RegionCreator';
import RegionList from './RegionList';
import RegionRect, { RegionRectRef } from './RegionRect';
import { AnnotationRegion, Rect } from '../@types';
import { CreateArg } from './actions';
import { CreatorItemRegion, CreatorStatus } from '../store/creator';
import './RegionAnnotations.scss';

type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    createRegion: (arg: CreateArg) => void;
    isCreating: boolean;
    isDiscoverabilityEnabled: boolean;
    isRotated: boolean;
    location: number;
    message: string;
    resetCreator: () => void;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setMessage: (message: string) => void;
    setStaged: (staged: CreatorItemRegion | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorItemRegion | null;
    status: CreatorStatus;
};

type State = {
    rectRef?: RegionRectRef;
};

export default class RegionAnnotations extends React.PureComponent<Props, State> {
    static defaultProps = {
        annotations: [],
        isCreating: false,
        isDiscoverabilityEnabled: false,
        isRotated: false,
    };

    state: State = {};

    handleAnnotationActive = (annotationId: string | null): void => {
        const { setActiveAnnotationId } = this.props;

        setActiveAnnotationId(annotationId);
    };

    handleCancel = (): void => {
        const { resetCreator } = this.props;
        resetCreator();
    };

    handleChange = (text = ''): void => {
        const { setMessage } = this.props;
        setMessage(text);
    };

    handleStart = (): void => {
        const { setStaged, setStatus } = this.props;
        setStaged(null);
        setStatus(CreatorStatus.started);
    };

    handleStop = (shape: Rect): void => {
        const { location, setStaged, setStatus } = this.props;
        setStaged({ location, shape });
        setStatus(CreatorStatus.staged);
    };

    handleSubmit = (): void => {
        const { createRegion, message, staged } = this.props;

        if (!staged) {
            return;
        }

        createRegion({ ...staged, message });
    };

    renderCreator = (): JSX.Element => {
        const { isCreating, isDiscoverabilityEnabled, isRotated } = this.props;
        const canCreate = isCreating && !isRotated;

        return (
            <>
                {canCreate && (
                    <RegionCreator
                        className={classNames('ba-RegionAnnotations-creator', {
                            'is-discoverability-enabled': isDiscoverabilityEnabled,
                        })}
                        onStart={this.handleStart}
                        onStop={this.handleStop}
                    />
                )}
            </>
        );
    };

    renderList = (): JSX.Element => {
        const { activeAnnotationId, annotations } = this.props;

        return (
            <RegionList
                activeId={activeAnnotationId}
                annotations={annotations}
                className="ba-RegionAnnotations-list"
                onSelect={this.handleAnnotationActive}
            />
        );
    };

    setRectRef = (rectRef: RegionRectRef): void => {
        this.setState({ rectRef });
    };

    render(): JSX.Element {
        const { isCreating, isDiscoverabilityEnabled, isRotated, message, staged, status } = this.props;
        const { rectRef } = this.state;
        const canCreate = isCreating && !isRotated;
        const canReply = status !== CreatorStatus.started && status !== CreatorStatus.init;
        const isPending = status === CreatorStatus.pending;

        return (
            <>
                {isDiscoverabilityEnabled ? (
                    <>
                        {/* With discoverability, put the RegionCreator below the RegionList so that existing regions can be clicked */}
                        {this.renderCreator()}
                        {this.renderList()}
                    </>
                ) : (
                    <>
                        {this.renderList()}
                        {this.renderCreator()}
                    </>
                )}

                {/* Layer 3a: Staged (unsaved) annotation target, if any */}
                {canCreate && staged && (
                    <div className="ba-RegionAnnotations-target">
                        <RegionRect ref={this.setRectRef} isActive shape={staged.shape} />
                    </div>
                )}

                {/* Layer 3b: Staged (unsaved) annotation description popup, if 3a is ready */}
                {canCreate && staged && canReply && rectRef && (
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

import * as React from 'react';
import classNames from 'classnames';
import RegionCreator from './RegionCreator';
import RegionList from './RegionList';
import RegionRect, { RegionRectRef } from './RegionRect';
import { AnnotationRegion, Rect } from '../@types';
import { CreatorItemRegion, CreatorStatus } from '../store/creator';
import './RegionAnnotations.scss';

type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    isCreating: boolean;
    isDiscoverabilityEnabled: boolean;
    isRotated: boolean;
    location: number;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setReferenceShape: (rect: DOMRect) => void;
    setStaged: (staged: CreatorItemRegion | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorItemRegion | null;
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

    componentDidUpdate(_prevProps: Props, prevState: State): void {
        const { setReferenceShape } = this.props;
        const { rectRef } = this.state;
        const { rectRef: prevRectRef } = prevState;

        if (prevRectRef !== rectRef && rectRef) {
            setReferenceShape(rectRef.getBoundingClientRect());
        }
    }

    handleAnnotationActive = (annotationId: string | null): void => {
        const { setActiveAnnotationId } = this.props;

        setActiveAnnotationId(annotationId);
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
        const { isCreating, isDiscoverabilityEnabled, isRotated, staged } = this.props;
        const canCreate = isCreating && !isRotated;

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
            </>
        );
    }
}

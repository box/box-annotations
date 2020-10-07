import * as React from 'react';
import classNames from 'classnames';
import RegionCreator from './RegionCreator';
import RegionRect, { RegionRectRef } from './RegionRect';
import { Rect } from '../@types';
import { CreatorItemRegion, CreatorStatus } from '../store/creator';
import './RegionCreation.scss';

type Props = {
    isCreating: boolean;
    isDiscoverabilityEnabled: boolean;
    isRotated: boolean;
    location: number;
    resetCreator: () => void;
    setReferenceShape: (rect: DOMRect) => void;
    setStaged: (staged: CreatorItemRegion | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorItemRegion | null;
};

type State = {
    rectRef?: RegionRectRef;
};

export default class RegionCreation extends React.PureComponent<Props, State> {
    static defaultProps = {
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

    handleAbort = (): void => {
        const { resetCreator } = this.props;
        resetCreator();
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

    setRectRef = (rectRef: RegionRectRef): void => {
        this.setState({ rectRef });
    };

    render(): JSX.Element {
        const { isCreating, isDiscoverabilityEnabled, isRotated, staged } = this.props;
        const canCreate = isCreating && !isRotated;

        return (
            <>
                {canCreate && (
                    <RegionCreator
                        className={classNames('ba-RegionCreation-creator', {
                            'is-discoverability-enabled': isDiscoverabilityEnabled,
                        })}
                        onAbort={this.handleAbort}
                        onStart={this.handleStart}
                        onStop={this.handleStop}
                    />
                )}

                {canCreate && staged && (
                    <div className="ba-RegionCreation-target">
                        <RegionRect ref={this.setRectRef} isActive shape={staged.shape} />
                    </div>
                )}
            </>
        );
    }
}

import * as React from 'react';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
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
    setReferenceId: (uuid: string) => void;
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
        if (!rectRef) {
            return;
        }

        const { setReferenceId } = this.props;
        const stagedUuid = uuidv4();

        rectRef.setAttribute('data-staged-id', stagedUuid);

        setReferenceId(stagedUuid);
    };

    render(): JSX.Element | null {
        const { isCreating, isDiscoverabilityEnabled, isRotated, staged } = this.props;
        const canCreate = isCreating && !isRotated;

        if (!canCreate) {
            return null;
        }

        return (
            <>
                <RegionCreator
                    className={classNames('ba-RegionCreation-creator', {
                        'is-discoverability-enabled': isDiscoverabilityEnabled,
                    })}
                    onAbort={this.handleAbort}
                    onStart={this.handleStart}
                    onStop={this.handleStop}
                />

                {staged && (
                    <div className="ba-RegionCreation-target">
                        <RegionRect ref={this.setRectRef} isActive shape={staged.shape} />
                    </div>
                )}
            </>
        );
    }
}

import * as React from 'react';
import RegionCreator from './RegionCreator';
import RegionRect, { RegionRectRef } from './RegionRect';
import { Rect } from '../@types';
import { CreatorItemRegion, CreatorStatus } from '../store/creator';
import './RegionCreation.scss';

type Props = {
    isCreating: boolean;
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

    handleStagedMount = (uuid: string): void => {
        const { setReferenceId } = this.props;
        setReferenceId(uuid);
    };

    handleStop = (shape: Rect): void => {
        const { location, setStaged, setStatus } = this.props;
        setStaged({ location, shape });
        setStatus(CreatorStatus.staged);
    };

    render(): JSX.Element | null {
        const { isCreating, isRotated, staged } = this.props;

        if (isRotated) {
            return null;
        }

        return (
            <>
                {isCreating && (
                    <RegionCreator
                        className="ba-RegionCreation-creator"
                        onAbort={this.handleAbort}
                        onStart={this.handleStart}
                        onStop={this.handleStop}
                    />
                )}

                {staged && (
                    <div className="ba-RegionCreation-target">
                        <RegionRect isActive onMount={this.handleStagedMount} shape={staged.shape} />
                    </div>
                )}
            </>
        );
    }
}

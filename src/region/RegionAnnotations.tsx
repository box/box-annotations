import * as React from 'react';
import merge from 'lodash/merge';
import PopupReply from '../components/Popups/PopupReply';
import RegionAnnotation from './RegionAnnotation';
import RegionCreator from './RegionCreator';
import { Annotation, Rect, NewAnnotation, TargetRegion } from '../@types';
import { CreatorItem, CreatorStatus } from '../store/creator';
import './RegionAnnotations.scss';

type Props = {
    annotations: Annotation[];
    isCreating: boolean;
    page: number;
    scale: number;
    saveAnnotation: (annotation: NewAnnotation) => void;
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

    setStaged(data: Partial<CreatorItem>): void {
        const { staged, page, setStaged } = this.props;
        setStaged(merge({ location: page }, staged, data));
    }

    setStatus(status: CreatorStatus): void {
        const { setStatus } = this.props;
        setStatus(status);
    }

    handleCancel = (): void => {
        this.reset();
    };

    handleChange = (text?: string): void => {
        this.setStaged({ message: text });
    };

    handleSubmit = (): void => {
        const { staged, saveAnnotation } = this.props;

        if (!staged) {
            return;
        }

        const { location, message = '', shape } = staged;

        saveAnnotation({
            description: {
                message,
                type: 'reply',
            },
            target: {
                location: {
                    type: 'page',
                    value: location,
                },
                shape,
                type: 'region',
            },
        });

        this.reset();
    };

    handleDone = (): void => {
        this.setStatus(CreatorStatus.ready);
    };

    handleDraw = (shape: Rect): void => {
        this.setStaged({ shape: this.scaleShape(shape, true) }); // Store at a scale of 1
        this.setStatus(CreatorStatus.init);
    };

    setTargetRef = (targetRef: HTMLAnchorElement): void => {
        this.setState({ targetRef });
    };

    scaleShape({ height, width, x, y, ...rest }: Rect, invert = false): Rect {
        const { scale } = this.props;
        const ratio = invert ? 1 / scale : scale;

        return {
            ...rest,
            height: Math.round(height * ratio),
            width: Math.round(width * ratio),
            x: Math.round(x * ratio),
            y: Math.round(y * ratio),
        };
    }

    reset(): void {
        const { setStaged, setStatus } = this.props;
        setStaged(null);
        setStatus(CreatorStatus.init);
    }

    render(): JSX.Element {
        const { annotations, isCreating, staged, status } = this.props;
        const { targetRef } = this.state;
        const hasComment = staged && staged.message;
        const hasDrawn = status === CreatorStatus.ready;

        return (
            <>
                {/* Layer 1: Saved annotations */}
                <svg className="ba-RegionAnnotations-list">
                    {annotations.map(({ id, target }) => (
                        <RegionAnnotation
                            key={id}
                            annotationId={id}
                            shape={this.scaleShape((target as TargetRegion).shape)}
                        />
                    ))}
                </svg>

                {/* Layer 2: Transparent layer to handle click/drag events */}
                {isCreating && (
                    <RegionCreator
                        canDraw={!hasComment}
                        className="ba-RegionAnnotations-creator"
                        onDone={this.handleDone}
                        onDraw={this.handleDraw}
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
                {isCreating && staged && hasDrawn && targetRef && (
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

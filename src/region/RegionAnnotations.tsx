import * as React from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { Annotation, Rect, TargetRegion } from '../@types';
import PopupReply from '../components/Popups/PopupReply';
import RegionAnnotation from './RegionAnnotation';
import RegionCreator from './RegionCreator';
import './RegionAnnotations.scss';

type Props = {
    annotations: Annotation[];
    intl: IntlShape;
    isCreating: boolean;
};

type State = {
    current: Partial<Rect> | null;
    hasComment: boolean;
    hasDrawn: boolean;
};

export default class RegionAnnotations extends React.Component<Props, State> {
    static defaultProps = {
        annotations: [],
        isCreating: false, // TODO: Pass in from manager/annotator based on current mode
    };

    targetRef: React.RefObject<HTMLAnchorElement> = React.createRef();

    state: State = {
        current: null, // TODO: Move unsaved region state to central store
        hasComment: false,
        hasDrawn: false,
    };

    handleCancel = (): void => {
        this.reset();
    };

    handleChange = (text?: string): void => {
        this.setState({
            hasComment: !!text,
        });
    };

    handleSubmit = (): void => {
        // TODO: Update store with new shape/text

        this.reset();
    };

    handleDone = (): void => {
        this.setState({
            hasDrawn: true,
        });
    };

    handleDraw = (shape: Partial<Rect>): void => {
        this.setState({
            current: shape,
            hasDrawn: false, // Drawing is not yet complete
        });
    };

    reset(): void {
        this.setState({
            current: null,
            hasComment: false,
            hasDrawn: false,
        });
    }

    render(): JSX.Element {
        const { annotations, intl, isCreating } = this.props;
        const { current, hasComment, hasDrawn } = this.state;
        const { current: targetRef } = this.targetRef;

        return (
            <RawIntlProvider value={intl}>
                {/* Layer 1: Saved annotations */}
                <svg className="ba-RegionAnnotations-list">
                    {annotations.map(({ id, target }) => (
                        <RegionAnnotation key={id} annotationId={id} shape={(target as TargetRegion).shape} />
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
                {isCreating && current && (
                    <svg className="ba-RegionAnnotations-target">
                        <RegionAnnotation ref={this.targetRef} annotationId="temp" isActive shape={current} />
                    </svg>
                )}

                {/* Layer 3b: New, unsaved annotation description popup, if 3a is ready */}
                {isCreating && current && hasDrawn && targetRef && (
                    <div className="ba-RegionAnnotations-popup">
                        <PopupReply
                            className="ba-RegionAnnotations-popup"
                            onCancel={this.handleCancel}
                            onChange={this.handleChange}
                            onSubmit={this.handleSubmit}
                            reference={targetRef}
                        />
                    </div>
                )}
            </RawIntlProvider>
        );
    }
}

import * as React from 'react';
import noop from 'lodash/noop';
import HighlightCreator from './HighlightCreator';
import HighlightList from './HighlightList';
import PopupReply from '../components/Popups/PopupReply';
import SingleHighlightAnnotation from './SingleHighlightAnnotation';
import { AnnotationHighlight, Rect } from '../@types';
import { CreatorHighlight, CreatorStatus, Mode } from '../store';
import './HighlightAnnotations.scss';

type CreateArg = {
    location: number;
    message: string;
    shapes: Rect[];
    text?: string;
};

type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationHighlight[];
    createHighlight?: (arg: CreateArg) => void;
    isCreating: boolean;
    location: number;
    message: string;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setMessage: (message: string) => void;
    setMode: (mode: Mode) => void;
    setStaged: (staged: CreatorHighlight | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorHighlight | null;
    status: CreatorStatus;
};

type State = {
    highlightRef?: HTMLAnchorElement;
};

export function getStagedAnnotation(
    staged?: CreatorHighlight | null,
): Pick<AnnotationHighlight, 'id' | 'target'> | null {
    if (!staged) {
        return null;
    }

    const { location, shapes } = staged;

    return {
        id: 'staged',
        target: {
            location: {
                type: 'page',
                value: location,
            },
            shapes,
            type: 'highlight',
        },
    };
}

export default class HighlightAnnotations extends React.PureComponent<Props, State> {
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

    // TODO: For testing purposes only
    handleClick = (): void => {
        const { location, setMode, setStaged, setStatus } = this.props;
        // Page 1 "troublesome personality" of the Van Gogh doc
        const shapes = [
            {
                height: 2.0239190432,
                width: 21.1208338959,
                x: 38.7415889335,
                y: 75.0991835327,
                type: 'rect' as const,
            },
        ];

        setMode(Mode.HIGHLIGHT);
        setStatus(CreatorStatus.staged);
        setStaged({ location, shapes });
    };

    handleSubmit = (): void => {
        const { createHighlight = noop, message, staged } = this.props;

        if (!staged) {
            return;
        }

        createHighlight({ ...(staged as CreatorHighlight), message });
    };

    setHighlightRef = (highlightRef: HTMLAnchorElement): void => {
        this.setState({ highlightRef });
    };

    render(): JSX.Element {
        const { activeAnnotationId, annotations, isCreating, message, staged, status } = this.props;
        const { highlightRef } = this.state;
        const stagedAnnotation = getStagedAnnotation(staged);
        const canReply = status !== CreatorStatus.started && status !== CreatorStatus.init;
        const isPending = status === CreatorStatus.pending;

        return (
            <>
                <button
                    onClick={this.handleClick}
                    style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'auto' }}
                    type="button"
                >
                    Set Staged
                </button>

                {/* Layer 1: Saved annotations */}
                <HighlightList
                    activeId={activeAnnotationId}
                    annotations={annotations}
                    onSelect={this.handleAnnotationActive}
                />

                {/* Layer 2: Drawn (unsaved) incomplete annotation target, if any */}
                {isCreating && <HighlightCreator className="ba-HighlightAnnotations-creator" />}

                {/* Layer 3a: Staged (unsaved) highlight target, if any */}
                {isCreating && staged && stagedAnnotation && (
                    <SingleHighlightAnnotation
                        ref={this.setHighlightRef}
                        annotation={stagedAnnotation}
                        className="ba-HighlightAnnotations-target"
                    />
                )}

                {/* Layer 3b: Staged (unsaved) annotation description popup, if 3a is ready */}
                {isCreating && staged && canReply && highlightRef && (
                    <div className="ba-HighlightAnnotations-popup">
                        <PopupReply
                            isPending={isPending}
                            onCancel={this.handleCancel}
                            onChange={this.handleChange}
                            onSubmit={this.handleSubmit}
                            reference={highlightRef}
                            value={message}
                        />
                    </div>
                )}
            </>
        );
    }
}

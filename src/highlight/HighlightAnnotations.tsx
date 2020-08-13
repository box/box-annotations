import * as React from 'react';
import noop from 'lodash/noop';
import HighlightCanvas from './HighlightCanvas';
import HighlightCreator from './HighlightCreator';
import HighlightList from './HighlightList';
import HighlightSvg from './HighlightSvg';
import HighlightTarget from './HighlightTarget';
import PopupReply from '../components/Popups/PopupReply';
import { AnnotationHighlight } from '../@types';
import { CreatorHighlight, CreatorStatus, Mode } from '../store';
import './HighlightAnnotations.scss';

export interface CreateArg extends Pick<AnnotationHighlight, 'target'> {
    message: string;
}

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

const HighlightAnnotations = (props: Props): JSX.Element => {
    const {
        activeAnnotationId,
        annotations = [],
        createHighlight = noop,
        isCreating = false,
        location,
        message,
        setActiveAnnotationId,
        setMessage,
        setMode,
        setStaged,
        setStatus,
        staged,
        status,
    } = props;
    const [highlightRef, setHighlightRef] = React.useState<HTMLAnchorElement | null>(null);

    const canReply = status !== CreatorStatus.started && status !== CreatorStatus.init;
    const isPending = status === CreatorStatus.pending;

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };

    const handleCancel = (): void => {
        setMessage('');
        setStaged(null);
        setStatus(CreatorStatus.init);
    };

    const handleChange = (text?: string): void => {
        setMessage(text || '');
    };

    // TODO: For testing purposes only
    const handleClick = (): void => {
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
        setStaged({ target: { location: { value: location, type: 'page' }, shapes, type: 'highlight' } });
    };

    const handleSubmit = (): void => {
        if (!staged) {
            return;
        }

        createHighlight({ ...staged, message });
    };

    return (
        <>
            <button
                onClick={handleClick}
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'auto' }}
                type="button"
            >
                Set Staged
            </button>

            {/* Layer 1: Saved annotations */}
            <HighlightList activeId={activeAnnotationId} annotations={annotations} onSelect={handleAnnotationActive} />

            {/* Layer 2: Drawn (unsaved) incomplete annotation target, if any */}
            {isCreating && <HighlightCreator className="ba-HighlightAnnotations-creator" />}

            {/* Layer 3a: Staged (unsaved) highlight target, if any */}
            {isCreating && staged && (
                <div className="ba-HighlightAnnotations-target">
                    <HighlightCanvas annotations={staged} />
                    <HighlightSvg>
                        <HighlightTarget ref={setHighlightRef} annotationId="staged" rects={staged.target.shapes} />
                    </HighlightSvg>
                </div>
            )}

            {/* Layer 3b: Staged (unsaved) annotation description popup, if 3a is ready */}
            {isCreating && staged && canReply && highlightRef && (
                <div className="ba-HighlightAnnotations-popup">
                    <PopupReply
                        isPending={isPending}
                        onCancel={handleCancel}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        reference={highlightRef}
                        value={message}
                    />
                </div>
            )}
        </>
    );
};

export default HighlightAnnotations;

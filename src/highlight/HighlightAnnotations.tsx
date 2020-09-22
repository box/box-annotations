import * as React from 'react';
import noop from 'lodash/noop';
import HighlightCanvas from './HighlightCanvas';
import HighlightCreator from './HighlightCreator';
import HighlightList from './HighlightList';
import HighlightSvg from './HighlightSvg';
import HighlightTarget from './HighlightTarget';
import PopupHighlight from '../components/Popups/PopupHighlight';
import PopupReply from '../components/Popups/PopupReply';
import { AnnotationHighlight } from '../@types';
import { CreateArg } from './actions';
import { CreatorItemHighlight, CreatorStatus, SelectionItem } from '../store';
import { getBoundingRect, getShapeRelativeToContainer } from './highlightUtil';
import './HighlightAnnotations.scss';

type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationHighlight[];
    createHighlight?: (arg: CreateArg) => void;
    isCreating: boolean;
    isPromoting: boolean;
    isSelecting: boolean;
    location: number;
    message: string;
    resetCreator: () => void;
    selection: SelectionItem | null;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setIsPromoting: (isPromoting: boolean) => void;
    setMessage: (message: string) => void;
    setStaged: (staged: CreatorItemHighlight | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorItemHighlight | null;
    status: CreatorStatus;
};

const HighlightAnnotations = (props: Props): JSX.Element => {
    const {
        activeAnnotationId,
        annotations = [],
        createHighlight = noop,
        isCreating = false,
        isPromoting = false,
        isSelecting = false,
        message,
        resetCreator,
        selection,
        setActiveAnnotationId,
        setIsPromoting,
        setMessage,
        setStaged,
        setStatus,
        staged,
        status,
    } = props;
    const [highlightRef, setHighlightRef] = React.useState<HTMLAnchorElement | null>(null);

    const canCreate = isCreating || isPromoting;
    const canReply = status !== CreatorStatus.started && status !== CreatorStatus.init;
    const isPending = status === CreatorStatus.pending;

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };

    const handleCancel = (): void => {
        resetCreator();
    };

    const handleChange = (text = ''): void => {
        setMessage(text);
    };

    const handleSubmit = (): void => {
        if (!staged) {
            return;
        }

        createHighlight({ ...staged, message });
    };

    const stageSelection = (): void => {
        if (!selection) {
            return;
        }

        const { containerRect, location, rects } = selection;

        setStaged({
            location,
            shapes: rects.map(rect => ({
                ...getShapeRelativeToContainer(rect, containerRect),
                type: 'rect',
            })),
        });
        setStatus(CreatorStatus.staged);
    };

    const handlePromote = (): void => {
        stageSelection();

        setIsPromoting(true);
    };

    React.useEffect(() => {
        if (!isSelecting) {
            return;
        }

        setStaged(null);
        setStatus(CreatorStatus.init);
    }, [isSelecting]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (!isCreating || !selection || !selection.canCreate) {
            return;
        }

        stageSelection();
    }, [isCreating, selection]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {/* Layer 1: Saved annotations */}
            <HighlightList activeId={activeAnnotationId} annotations={annotations} onSelect={handleAnnotationActive} />

            {/* Layer 2: Drawn (unsaved) incomplete annotation target, if any */}
            {canCreate && <HighlightCreator className="ba-HighlightAnnotations-creator" />}

            {/* Layer 3a: Staged (unsaved) highlight target, if any */}
            {canCreate && staged && (
                <div className="ba-HighlightAnnotations-target">
                    <HighlightCanvas shapes={staged.shapes} />
                    <HighlightSvg>
                        <HighlightTarget ref={setHighlightRef} annotationId="staged" shapes={staged.shapes} />
                    </HighlightSvg>
                </div>
            )}

            {/* Layer 3b: Staged (unsaved) annotation description popup, if 3a is ready */}
            {canCreate && staged && canReply && highlightRef && (
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

            {/* Layer 4: Annotations promoter to promote selection to staged */}
            {selection && (!isCreating || !selection.canCreate) && (
                <div className="ba-HighlightAnnotations-popup">
                    <PopupHighlight
                        disabled={!selection.canCreate}
                        onClick={handlePromote}
                        shape={getBoundingRect(selection.rects)}
                    />
                </div>
            )}
        </>
    );
};

export default HighlightAnnotations;

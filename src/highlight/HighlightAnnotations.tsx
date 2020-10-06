import * as React from 'react';
import HighlightCanvas from './HighlightCanvas';
import HighlightList from './HighlightList';
import HighlightSvg from './HighlightSvg';
import HighlightTarget from './HighlightTarget';
import PopupHighlight from '../components/Popups/PopupHighlight';
import PopupHighlightError from '../components/Popups/PopupHighlightError';
import useWindowSize from '../common/useWindowSize';
import { AnnotationHighlight } from '../@types';
import { CreateArg } from './actions';
import { CreatorItemHighlight, CreatorStatus, SelectionArg, SelectionItem } from '../store';
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
    selection: SelectionItem | null;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setIsPromoting: (isPromoting: boolean) => void;
    setReferenceShape: (rect: DOMRect) => void;
    setSelection: (selection: SelectionArg | null) => void;
    setStaged: (staged: CreatorItemHighlight | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorItemHighlight | null;
};

const HighlightAnnotations = (props: Props): JSX.Element => {
    const {
        activeAnnotationId,
        annotations = [],
        isCreating = false,
        isPromoting = false,
        isSelecting = false,
        selection,
        setActiveAnnotationId,
        setIsPromoting,
        setReferenceShape,
        setSelection,
        setStaged,
        setStatus,
        staged,
    } = props;
    const [highlightRef, setHighlightRef] = React.useState<HTMLAnchorElement | null>(null);
    const windowSize = useWindowSize();

    const canCreate = isCreating || isPromoting;

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
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

    const handleCancel = (): void => {
        setSelection(null);
    };

    React.useEffect(() => {
        if (!isSelecting) {
            return;
        }

        setStaged(null);
        setStatus(CreatorStatus.init);
    }, [isSelecting]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (!isCreating || !selection || selection.hasError) {
            return;
        }

        stageSelection();
    }, [isCreating, selection]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (highlightRef === null) {
            return;
        }

        setReferenceShape(highlightRef.getBoundingClientRect());
    }, [highlightRef, windowSize]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {/* Layer 1: Saved annotations */}
            <HighlightList activeId={activeAnnotationId} annotations={annotations} onSelect={handleAnnotationActive} />

            {/* Layer 2: Staged (unsaved) highlight target, if any */}
            {canCreate && staged && (
                <div className="ba-HighlightAnnotations-target">
                    <HighlightCanvas shapes={staged.shapes} />
                    <HighlightSvg>
                        <HighlightTarget ref={setHighlightRef} annotationId="staged" shapes={staged.shapes} />
                    </HighlightSvg>
                </div>
            )}

            {/* Layer 3a: Annotations promoter to promote selection to staged */}
            {!isCreating && selection && !selection.hasError && (
                <div className="ba-HighlightAnnotations-popup">
                    <PopupHighlight
                        onCancel={handleCancel}
                        onClick={handlePromote}
                        shape={getBoundingRect(selection.rects)}
                    />
                </div>
            )}

            {/* Layer 3b: Highlight error popup */}
            {selection && selection.hasError && (
                <div className="ba-HighlightAnnotations-popup">
                    <PopupHighlightError onCancel={handleCancel} shape={getBoundingRect(selection.rects)} />
                </div>
            )}
        </>
    );
};

export default HighlightAnnotations;

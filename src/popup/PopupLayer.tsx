import * as React from 'react';
import noop from 'lodash/noop';
import PopupReply from '../components/Popups/PopupReply';
import PopupV2 from '../components/Popups/PopupV2';
import { CreateArg as DrawingCreateArg } from '../drawing/actions';
import { CreateArg as HighlightCreateArg } from '../highlight/actions';
import { CreateArg as RegionCreateArg } from '../region/actions';
import {
    CreatorItem,
    CreatorStatus,
    isCreatorStagedDrawing,
    isCreatorStagedHighlight,
    isCreatorStagedRegion,
    Mode,
} from '../store';
import { PopupReference } from '../components/Popups/Popper';

import { TARGET_TYPE } from '../constants';

import './PopupLayer.scss';

export type Props = {
    activeAnnotationId: string | null;
    createDrawing?: (arg: DrawingCreateArg) => void;
    createHighlight?: (arg: HighlightCreateArg) => void;
    createRegion?: (arg: RegionCreateArg) => void;
    isPromoting: boolean;
    isThreadedAnnotation?: boolean;
    location: number;
    message: string;
    mode: Mode;
    referenceId: string | null;
    resetCreator: () => void;
    setMessage: (message: string) => void;
    staged?: CreatorItem | null;
    status: CreatorStatus;
    targetType: TARGET_TYPE;
};

const modeStagedMap: { [M in Mode]?: (staged: CreatorItem | null) => boolean } = {
    [Mode.DRAWING]: isCreatorStagedDrawing,
    [Mode.HIGHLIGHT]: isCreatorStagedHighlight,
    [Mode.REGION]: isCreatorStagedRegion,
};

const PopupLayer = (props: Props): JSX.Element | null => {
    const {
        activeAnnotationId,
        createDrawing = noop,
        createHighlight = noop,
        createRegion = noop,
        isPromoting = false,
        isThreadedAnnotation = false,
        message,
        mode,
        referenceId,
        resetCreator,
        setMessage,
        staged,
        status,
        targetType,
    } = props;

    const [reference, setReference] = React.useState<PopupReference | null>(null);
    const [activeReference, setActiveReference] = React.useState<PopupReference | null>(null);
    const canCreate = (modeStagedMap[mode]?.(staged ?? null) ?? false) || isPromoting;
    const canReply = status !== CreatorStatus.started && status !== CreatorStatus.init;
    const isPending = status === CreatorStatus.pending;

    const handleCancel = (): void => {
        resetCreator();
    };

    const handleChange = (text = ''): void => {
        setMessage(text);
    };

    const handleSubmit = (text?: string): void => {
        if (!staged) {
            return;
        }

        const submitMessage = text ?? message;

        if (isCreatorStagedHighlight(staged)) {
            createHighlight({ ...staged, message: submitMessage, targetType });
        } else if (isCreatorStagedRegion(staged)) {
            createRegion({ ...staged, message: submitMessage, targetType });
        } else if (isCreatorStagedDrawing(staged)) {
            createDrawing({ ...staged, message: submitMessage, targetType });
        }
    };

    React.useEffect(() => {
        setReference(referenceId ? document.querySelector(`[data-ba-reference-id="${referenceId}"]`) : null);
    }, [referenceId]);

    React.useEffect(() => {
        if (activeAnnotationId && isThreadedAnnotation) {
            const el = document.querySelector(`[data-ba-annotation-id="${CSS.escape(activeAnnotationId)}"]`);
            setActiveReference(el);
        } else {
            setActiveReference(null);
        }
    }, [activeAnnotationId, isThreadedAnnotation]);

    const showCreator = canCreate && canReply && reference && staged;

    if (showCreator && isThreadedAnnotation) {
        return (
            <div className="ba-PopupLayer-popup">
                <PopupV2
                    onSubmit={handleSubmit}
                    reference={reference}
                />
            </div>
        );
    }

    if (showCreator) {
        return (
            <div className="ba-PopupLayer-popup">
                <PopupReply
                    isPending={isPending}
                    onCancel={handleCancel}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    reference={reference}
                    value={message}
                />
            </div>
        );
    }

    if (isThreadedAnnotation && activeAnnotationId && activeReference) {
        return (
            <div className="ba-PopupLayer-popup">
                <PopupV2
                    annotationId={activeAnnotationId}
                    onSubmit={handleSubmit}
                    reference={activeReference}
                />
            </div>
        );
    }

    return null;
};

export default PopupLayer;

import * as React from 'react';
import * as ReactDOM from 'react-dom';
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

import { MEDIA_LOCATION_INDEX, TARGET_TYPE } from '../constants';
import { CSS_CONTAINER_CLASS } from '../common/BaseAnnotator';

import './PopupLayer.scss';

export type Props = {
    activeAnnotationId: string | null;
    activeAnnotationLocation?: number;
    createDrawing?: (arg: DrawingCreateArg) => void;
    createHighlight?: (arg: HighlightCreateArg) => void;
    createRegion?: (arg: RegionCreateArg) => void;
    isPromoting: boolean;
    isThreadedAnnotation?: boolean;
    location: number;
    message: string;
    mode: Mode;
    popupPortalEl?: HTMLElement | null;
    referenceId: string | null;
    resetCreator: () => void;
    setMessage: (message: string) => void;
    staged?: CreatorItem | null;
    status: CreatorStatus;
    targetType: TARGET_TYPE;
};

export const getAnnotationTargetRoot = (popupPortalEl?: HTMLElement | null): ParentNode =>
    popupPortalEl?.closest(`.${CSS_CONTAINER_CLASS}`) ?? document;

const modeStagedMap: { [M in Mode]?: (staged: CreatorItem | null) => boolean } = {
    [Mode.DRAWING]: isCreatorStagedDrawing,
    [Mode.HIGHLIGHT]: isCreatorStagedHighlight,
    [Mode.REGION]: isCreatorStagedRegion,
};

const ACTIVE_TARGET_OBSERVER_TIMEOUT_MS = 10000;

const PopupLayer = (props: Props): JSX.Element | null => {
    const {
        activeAnnotationId,
        activeAnnotationLocation,
        createDrawing = noop,
        createHighlight = noop,
        createRegion = noop,
        isPromoting = false,
        isThreadedAnnotation = false,
        location,
        message,
        mode,
        popupPortalEl,
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

    // Wait for the target to mount (e.g. deep link). Limit the search to this pane and page.
    React.useEffect(() => {
        const isMatchingPage = location === MEDIA_LOCATION_INDEX || activeAnnotationLocation === location;

        if (!activeAnnotationId || !isThreadedAnnotation || !isMatchingPage) {
            setActiveReference(null);
            return noop;
        }

        const root = getAnnotationTargetRoot(popupPortalEl);
        const selector = `[data-ba-annotation-id="${CSS.escape(activeAnnotationId)}"]`;
        const existing = root.querySelector(selector);
        if (existing) {
            setActiveReference(existing);
            return noop;
        }

        setActiveReference(null);
        const observer = new MutationObserver(() => {
            const el = root.querySelector(selector);
            if (el) {
                setActiveReference(el);
                observer.disconnect();
            }
        });
        const observeTarget = root instanceof Document ? document.body : root;
        observer.observe(observeTarget, { childList: true, subtree: true });

        const timeoutId = window.setTimeout(() => {
            observer.disconnect();
        }, ACTIVE_TARGET_OBSERVER_TIMEOUT_MS);

        return () => {
            observer.disconnect();
            window.clearTimeout(timeoutId);
        };
    }, [activeAnnotationId, activeAnnotationLocation, isThreadedAnnotation, location, popupPortalEl]);

    const showCreator = canCreate && canReply && reference && staged;

    if (showCreator && isThreadedAnnotation) {
        return (
            <div className="ba-PopupLayer-popup">
                <PopupV2 onSubmit={handleSubmit} popupPortalEl={popupPortalEl} reference={reference} />
            </div>
        );
    }

    if (showCreator) {
        if (!popupPortalEl) return null;
        return ReactDOM.createPortal(
            <div className="ba-PopupLayer-popup">
                <PopupReply
                    isPending={isPending}
                    onCancel={handleCancel}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    reference={reference}
                    value={message}
                />
            </div>,
            popupPortalEl,
        );
    }

    if (isThreadedAnnotation && activeAnnotationId && activeReference) {
        return (
            <div className="ba-PopupLayer-popup">
                <PopupV2
                    annotationId={activeAnnotationId}
                    onSubmit={handleSubmit}
                    popupPortalEl={popupPortalEl}
                    reference={activeReference}
                />
            </div>
        );
    }

    return null;
};

export default PopupLayer;

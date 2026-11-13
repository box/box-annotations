import * as React from 'react';
import noop from 'lodash/noop';
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

const modeStagedMap: { [M in Mode]?: (staged: CreatorItem | null) => boolean } = {
    [Mode.DRAWING]: isCreatorStagedDrawing,
    [Mode.HIGHLIGHT]: isCreatorStagedHighlight,
    [Mode.REGION]: isCreatorStagedRegion,
};

const ACTIVE_TARGET_OBSERVER_TIMEOUT_MS = 10000;

const PopupLayer = (props: Props): JSX.Element | null => {
    const {
        activeAnnotationId,
        createDrawing = noop,
        createHighlight = noop,
        createRegion = noop,
        isPromoting = false,
        message,
        mode,
        popupPortalEl,
        referenceId,
        resetCreator,
        staged,
        status,
        targetType,
    } = props;

    const [reference, setReference] = React.useState<PopupReference | null>(null);
    const [activeReference, setActiveReference] = React.useState<PopupReference | null>(null);
    const canCreate = (modeStagedMap[mode]?.(staged ?? null) ?? false) || isPromoting;
    const canReply = status !== CreatorStatus.started && status !== CreatorStatus.init;

    const handleCancel = (): void => {
        resetCreator();
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

    // activeAnnotationId can be set (e.g. via deep link) before the target DOM node mounts;
    // observe until it appears, or give up after ACTIVE_TARGET_OBSERVER_TIMEOUT_MS.
    React.useEffect(() => {
        if (!activeAnnotationId) {
            setActiveReference(null);
            return noop;
        }

        const selector = `[data-ba-annotation-id="${CSS.escape(activeAnnotationId)}"]`;
        const existing = document.querySelector(selector);
        if (existing) {
            setActiveReference(existing);
            return noop;
        }

        setActiveReference(null);
        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                setActiveReference(el);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        const timeoutId = window.setTimeout(() => {
            observer.disconnect();
        }, ACTIVE_TARGET_OBSERVER_TIMEOUT_MS);

        return () => {
            observer.disconnect();
            window.clearTimeout(timeoutId);
        };
    }, [activeAnnotationId]);

    const showCreator = canCreate && canReply && reference && staged;

    if (showCreator) {
        return (
            <div className="ba-PopupLayer-popup">
                <PopupV2
                    onCancel={handleCancel}
                    onSubmit={handleSubmit}
                    popupPortalEl={popupPortalEl}
                    reference={reference}
                />
            </div>
        );
    }

    if (activeAnnotationId && activeReference) {
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

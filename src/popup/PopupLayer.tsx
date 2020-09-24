import * as React from 'react';
import noop from 'lodash/noop';
import PopupReply from '../components/Popups/PopupReply';
import { CreateArg as HighlightCreateArg } from '../highlight/actions';
import { CreateArg as RegionCreateArg } from '../region/actions';
import { CreatorItem, CreatorStatus, isCreatorStagedHighlight, isCreatorStagedRegion } from '../store';
import { Shape } from '../@types';
import './PopupLayer.scss';
import { PopupReference } from '../components/Popups/Popper';

type Props = {
    createHighlight?: (arg: HighlightCreateArg) => void;
    createRegion?: (arg: RegionCreateArg) => void;
    isCreating: boolean;
    isPromoting: boolean;
    location: number;
    message: string;
    popupReference?: Shape;
    resetCreator: () => void;
    setMessage: (message: string) => void;
    staged?: CreatorItem | null;
    status: CreatorStatus;
};

const Popup = (props: Props): JSX.Element | null => {
    const {
        createHighlight = noop,
        createRegion = noop,
        isCreating = false,
        isPromoting = false,
        message,
        popupReference,
        resetCreator,
        setMessage,
        staged,
        status,
    } = props;

    const [reference, setReference] = React.useState<PopupReference | null>(null);
    const canCreate = isCreating || isPromoting;
    const canReply = status !== CreatorStatus.started && status !== CreatorStatus.init;
    const isPending = status === CreatorStatus.pending;

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

        if (isCreatorStagedHighlight(staged)) {
            createHighlight({ ...staged, message });
        } else if (isCreatorStagedRegion(staged)) {
            createRegion({ ...staged, message });
        }
    };

    React.useEffect(() => {
        if (!popupReference) {
            return;
        }

        const { height, width, x, y } = popupReference;

        const virtualElement = {
            getBoundingClientRect: () => ({
                bottom: y + height,
                height,
                left: x,
                right: x + width,
                top: y,
                width,
            }),
        };

        setReference(virtualElement);
    }, [popupReference]);

    return (
        <>
            {canCreate && staged && canReply && reference && (
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
            )}
        </>
    );
};

export default Popup;

import React from 'react';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import IconTrash from 'box-ui-elements/es/icon/line/Trash16';
import messages from './messages';
import PopupBase from './PopupBase';
import { Options, PopupReference, Rect } from './Popper';
import './PopupDrawingToolbar.scss';

export type Props = {
    className?: string;
    onDelete: () => void;
    onReply: () => void;
    reference: PopupReference;
};

const options: Partial<Options> = {
    modifiers: [
        {
            name: 'eventListeners',
            options: {
                scroll: false,
            },
        },
        {
            name: 'offset',
            options: {
                offset: ({ popper }: { popper: Rect }) => [-popper.width / 2, 8],
            },
        },
        {
            name: 'preventOverflow',
            options: {
                padding: 5,
            },
        },
    ],
    placement: 'top',
};

const PopupDrawingToolbar = ({ className, onDelete, onReply, reference }: Props): JSX.Element => {
    const intl = useIntl();

    return (
        <PopupBase
            className={classNames(className, 'ba-PopupDrawingToolbar')}
            data-resin-component="popupDrawingToolbar"
            options={options}
            reference={reference}
        >
            <div className="ba-PopupDrawingToolbar-group">
                {/* TODO: Add undo/redo support */}
                <button
                    className="ba-PopupDrawingToolbar-delete"
                    data-testid="ba-PopupDrawingToolbar-delete"
                    onClick={() => onDelete()}
                    title={intl.formatMessage(messages.buttonDeleteDrawing)}
                    type="button"
                >
                    <IconTrash />
                </button>
            </div>
            <div className="ba-PopupDrawingToolbar-group">
                <button
                    className="ba-PopupDrawingToolbar-comment"
                    data-testid="ba-PopupDrawingToolbar-comment"
                    onClick={() => onReply()}
                    type="button"
                >
                    <FormattedMessage {...messages.buttonAddComent} />
                </button>
            </div>
        </PopupBase>
    );
};

export default PopupDrawingToolbar;

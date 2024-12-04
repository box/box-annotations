import React from 'react';
import IconHighlightTextAnnotation from 'box-ui-elements/es/icon/fill/AnnotationsHighlight16';
import noop from 'lodash/noop';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import useOutsideEvent from '../../common/useOutsideEvent';
import { clientBoundingRect, Options } from './Popper';
import { Shape } from '../../@types/model';
import './PopupHighlight.scss';

export type Props = {
    onCancel?: () => void;
    onSubmit?: () => void;
    shape: Shape;
};

const options: Partial<Options> = {
    modifiers: [
        {
            name: 'arrow',
            options: {
                element: '.ba-Popup-arrow',
            },
        },
        {
            name: 'eventListeners',
            options: {
                scroll: false,
            },
        },
        {
            name: 'offset',
            options: {
                offset: [0, 8],
            },
        },
        {
            name: 'preventOverflow',
            options: {
                padding: 5,
            },
        },
    ],
    placement: 'bottom',
};

export default function PopupHighlight({ onCancel = noop, onSubmit = noop, shape }: Props): JSX.Element {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const { height, width, x, y } = shape;

    const reference = {
        getBoundingClientRect: () => clientBoundingRect(height, width, x, y),
    };

    const handleKeydownOutside = (event: Event): void => {
        if (!(event instanceof KeyboardEvent) || event.key !== 'Enter' || event.ctrlKey || event.metaKey) {
            return;
        }

        event.preventDefault(); // Consume any enter keydown event if the promoter is open
        event.stopPropagation(); // Prevent the enter keydown event from adding a new line to the textarea

        onSubmit();
    };

    useOutsideEvent('keydown', buttonRef, handleKeydownOutside);
    useOutsideEvent('mousedown', buttonRef, onCancel);

    return (
        <PopupBase
            aria-live="polite"
            className="ba-PopupHighlight"
            options={options}
            reference={reference}
            role="dialog"
        >
            <button
                ref={buttonRef}
                aria-haspopup="dialog"
                className="ba-PopupHighlight-button"
                data-testid="ba-PopupHighlight-button"
                onClick={onSubmit}
                type="button"
            >
                <IconHighlightTextAnnotation className="ba-PopupHighlight-icon" />
                <FormattedMessage {...messages.popupHighlightPromoter} />
            </button>
        </PopupBase>
    );
}

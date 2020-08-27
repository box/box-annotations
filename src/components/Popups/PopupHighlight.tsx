import React from 'react';
import IconHighlightTextAnnotation from 'box-ui-elements/es/icon/fill/AnnotationsHighlight16';
import noop from 'lodash/noop';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import { Options } from './Popper';
import { Shape } from '../../@types/model';
import './PopupHighlight.scss';

export type Props = {
    onClick?: (event: React.MouseEvent) => void;
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

export default function PopupHighlight({ onClick = noop, shape }: Props): JSX.Element {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const { height, width, x, y } = shape;

    const reference = {
        getBoundingClientRect: () => ({
            bottom: y + height,
            height,
            left: x,
            right: x + width,
            top: y,
            width,
        }),
    };

    const handleEvent = (event: Event): void => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleClick = (event: React.MouseEvent): void => {
        onClick(event);
    };

    // Prevent events from propagating to upper elements. The upper elements'
    // mouse handlers are attached to real dom, so the belows have to attach to real dom too
    React.useEffect(() => {
        const { current: buttonEl } = buttonRef;

        if (buttonEl) {
            buttonEl.addEventListener('mousedown', handleEvent);
            buttonEl.addEventListener('mouseup', handleEvent);
        }

        return () => {
            if (buttonEl) {
                buttonEl.removeEventListener('mousedown', handleEvent);
                buttonEl.removeEventListener('mouseup', handleEvent);
            }
        };
    }, [buttonRef]);

    return (
        <PopupBase className="ba-PopupHighlight" options={options} reference={reference}>
            <button
                ref={buttonRef}
                className="ba-PopupHighlight-button"
                data-testid="ba-PopupHighlight-button"
                onClick={handleClick}
                type="button"
            >
                <IconHighlightTextAnnotation className="ba-PopupHighlight-icon" />
                <FormattedMessage {...messages.popupHighlightPromoter} />
            </button>
        </PopupBase>
    );
}

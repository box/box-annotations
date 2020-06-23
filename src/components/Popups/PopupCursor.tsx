import * as React from 'react';
import * as Popper from '@popperjs/core';
import * as ReactPopper from 'react-popper';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import './PopupCursor.scss';

const options: Partial<Popper.Options> = {
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: [0, 20],
            },
        },
    ],
    placement: 'right',
};

const generateElement = (x = 0, y = 0): Popper.VirtualElement => {
    return {
        getBoundingClientRect: () => ({
            width: 0,
            height: 0,
            top: y,
            right: x,
            bottom: y,
            left: x,
        }),
    };
};

export default function PopupCursor(): JSX.Element {
    const [popupElement, setPopupElement] = React.useState<HTMLDivElement | null>(null);
    const virtualElementRef = React.useRef<Popper.VirtualElement>(generateElement());
    const { attributes, styles, update } = ReactPopper.usePopper(virtualElementRef.current, popupElement, options);

    const handleMouseMove = ({ clientX: x, clientY: y }: MouseEvent): void => {
        virtualElementRef.current = generateElement(x, y);

        if (update) {
            update();
        }
    };

    React.useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    });

    return (
        <div
            ref={setPopupElement}
            className="ba-PopupCursor"
            data-testid="ba-PopupCursor"
            style={styles.popper}
            {...attributes.popper}
        >
            <FormattedMessage {...messages.regionCursorPrompt} />
        </div>
    );
}

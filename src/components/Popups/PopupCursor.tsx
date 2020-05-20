import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import { Options, VirtualElement } from './Popper';
import './PopupCursor.scss';

type Props = {};

const options: Partial<Options> = {
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

const generateGetBoundingClientRect = (x = 0, y = 0) => {
    return () => ({
        width: 0,
        height: 0,
        top: y,
        right: x,
        bottom: y,
        left: x,
    });
};

export default function PopupCursor(props: Props): JSX.Element {
    const popupRef = React.useRef<PopupBase>(null);

    const virtualElementRef = React.useRef<VirtualElement>({
        getBoundingClientRect: generateGetBoundingClientRect(),
    });

    const handleMouseMove = ({ clientX: x, clientY: y }: MouseEvent): void => {
        virtualElementRef.current.getBoundingClientRect = generateGetBoundingClientRect(x, y);

        const { current } = popupRef;
        if (current?.popper) {
            current.popper.update();
        }
    };

    React.useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    });

    return (
        <PopupBase
            ref={popupRef}
            className="ba-PopupCursor"
            options={options}
            reference={virtualElementRef.current}
            {...props}
        >
            <FormattedMessage {...messages.regionCursorPrompt} />
        </PopupBase>
    );
}

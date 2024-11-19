import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import { clientBoundingRect, Options, VirtualElement } from './Popper';
import './PopupCursor.scss';

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
    return () => clientBoundingRect(0, 0, x, y);
};

export default function PopupCursor(): JSX.Element {
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
    }, []);

    return (
        <PopupBase ref={popupRef} className="ba-PopupCursor" options={options} reference={virtualElementRef.current}>
            <FormattedMessage {...messages.regionCursorPrompt} />
        </PopupBase>
    );
}

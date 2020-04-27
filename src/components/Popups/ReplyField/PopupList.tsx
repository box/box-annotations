import * as React from 'react';
import classnames from 'classnames';
import PopupBase from '../PopupBase';
import { Options } from '../Popper';

import './PopupList.scss';

export type Props = {
    className?: string;
    reference: HTMLElement;
};

const options: Partial<Options> = {
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: [0, 3],
            },
        },
    ],
    placement: 'bottom-start',
};

const PopupList = ({ className, reference, ...rest }: Props): JSX.Element => {
    return (
        <div className={classnames('ba-PopupList', className)}>
            <PopupBase options={options} reference={reference} showArrow={false} {...rest}>
                <div className="ba-PopupList-startState">Mention someone to notify them</div>
            </PopupBase>
        </div>
    );
};

export default PopupList;

import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';

export type Props = {
    children?: React.ReactNode;
    isDisabled?: boolean;
    isPrimary?: boolean;
    onClick?: (event: React.MouseEvent) => void;
    type: 'button' | 'submit' | 'reset' | undefined;
} & HTMLAttributes<HTMLButtonElement>;

export default function ReplyButton({ children, isDisabled, isPrimary, onClick = noop, ...rest }: Props): JSX.Element {
    const handleClick = (event: React.MouseEvent): void => {
        if (isDisabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        onClick(event);
    };

    return (
        <button
            aria-disabled={isDisabled ? true : undefined}
            className={classNames('btn', {
                'btn-primary': isPrimary,
                'is-disabled': isDisabled,
            })}
            onClick={handleClick}
            type="button"
            {...rest}
        >
            {children}
        </button>
    );
}

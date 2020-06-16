import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';

export type Props = {
    children?: React.ReactNode;
    isDisabled?: boolean;
    isPrimary?: boolean;
    type: 'button' | 'submit' | 'reset' | undefined;
} & HTMLAttributes<HTMLButtonElement>;

export default function ReplyButton({ children, isDisabled, isPrimary, ...rest }: Props): JSX.Element {
    return (
        <button
            aria-disabled={isDisabled ? true : undefined}
            className={classNames('btn', {
                'btn-primary': isPrimary,
                'is-disabled': isDisabled,
            })}
            disabled={isDisabled ? true : undefined}
            type="button"
            {...rest}
        >
            {children}
        </button>
    );
}

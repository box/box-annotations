import * as React from 'react';
import classnames from 'classnames';

export type Props = {
    className?: string;
    defaultValue?: string;
    disabled?: boolean;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onClick: (event: React.SyntheticEvent) => void;
};

const ReplyField = (props: Props, ref: React.Ref<HTMLTextAreaElement>): JSX.Element => {
    const { className, ...rest } = props;

    return <textarea ref={ref} className={classnames('ba-TextArea', className)} {...rest} />;
};

export default React.forwardRef(ReplyField);

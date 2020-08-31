import React from 'react';
import classNames from 'classnames';
import { Props } from '../ItemRow';

export default React.forwardRef(({ className, isActive, ...rest }: Props, ref: React.Ref<HTMLDivElement>) => (
    <div ref={ref} className={classNames(className, 'ba-ItemRow', { 'is-active': isActive })} {...rest} />
));

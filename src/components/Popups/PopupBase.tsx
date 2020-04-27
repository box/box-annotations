import * as React from 'react';
import classNames from 'classnames';
import createPopper, { Instance, Options } from './Popper';
import './PopupBase.scss';

type Props = React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    className?: string;
    options: Partial<Options>;
    reference: HTMLElement;
    showArrow?: boolean;
};

export default class PopupBase extends React.PureComponent<Props> {
    static defaultProps = {
        options: {},
        showArrow: true,
    };

    popper?: Instance;

    popupRef: React.RefObject<HTMLDivElement> = React.createRef();

    componentDidMount(): void {
        this.popper = this.createPopper();
    }

    componentDidUpdate(prevProps: Props): void {
        const { options: prevOptions, reference: prevReference } = prevProps;
        const { options, reference } = this.props;

        if (!this.popper) {
            return;
        }

        if (options !== prevOptions) {
            this.popper.setOptions(options);
        }

        if (reference !== prevReference) {
            this.popper.destroy();
            this.popper = this.createPopper();
        }
    }

    componentWillUnmount(): void {
        if (this.popper) {
            this.popper.destroy();
        }
    }

    createPopper = (): Instance | undefined => {
        const { options, reference } = this.props;
        const { current: popupRef } = this.popupRef;

        if (!popupRef) {
            return undefined;
        }

        return createPopper(reference, popupRef, options);
    };

    handleEvent = (event: React.SyntheticEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    render(): JSX.Element {
        const { children, className, options, reference, showArrow, ...rest } = this.props; // eslint-disable-line @typescript-eslint/no-unused-vars

        return (
            <div
                ref={this.popupRef}
                className={classNames('ba-Popup', className)}
                onClick={this.handleEvent}
                onMouseDown={this.handleEvent}
                onMouseMove={this.handleEvent}
                onMouseUp={this.handleEvent}
                onTouchMove={this.handleEvent}
                onTouchStart={this.handleEvent}
                role="presentation"
                {...rest}
            >
                {showArrow && <div className="ba-Popup-arrow" />}
                <div className="ba-Popup-content">{children}</div>
            </div>
        );
    }
}

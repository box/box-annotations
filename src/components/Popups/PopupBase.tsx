import * as React from 'react';
import classNames from 'classnames';
import createPopper, { Instance, Options } from './Popper';
import './PopupBase.scss';

type Props = {
    children: React.ReactNode;
    className?: string;
    options: Partial<Options>;
    reference: HTMLElement;
};

export default class PopupBase extends React.PureComponent<Props> {
    static defaultProps = {
        options: {},
    };

    popper?: Instance;

    popupRef: React.RefObject<HTMLDivElement> = React.createRef();

    componentDidMount(): void {
        const { options, reference } = this.props;
        const { current: popupRef } = this.popupRef;

        if (popupRef) {
            this.popper = createPopper(reference, popupRef, options);
        }
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
            this.popper.update();
        }
    }

    componentWillUnmount(): void {
        if (this.popper) {
            this.popper.destroy();
        }
    }

    handleEvent = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    render(): JSX.Element {
        const { children, className } = this.props;

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
            >
                <div className="ba-Popup-arrow" />
                <div className="ba-Popup-content">{children}</div>
            </div>
        );
    }
}

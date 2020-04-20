import * as React from 'react';
import Button from 'box-ui-elements/es/components/button';
import PrimaryButton from 'box-ui-elements/es/components/primary-button';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import messages from './messages';
import './ReplyForm.scss';

type Props = {
    className?: string;
    defaultValue?: string;
    textareaRef?: React.RefObject<HTMLTextAreaElement>;
    onCancel: (text: string) => void;
    onChange: (text: string) => void;
    onSubmit: (text: string) => void;
};

type State = { text: string };

class ReplyForm extends React.Component<Props, State> {
    state: State = { text: '' };

    handleEvent = (event: React.SyntheticEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    handleCancel = (event: React.MouseEvent): void => {
        const { onCancel } = this.props;
        const { text } = this.state;

        this.handleEvent(event);
        onCancel(text);
    };

    handleChange = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const { onChange } = this.props;

        this.setState({ text: value });
        onChange(value);
    };

    handleSubmit = (event: React.FormEvent): void => {
        const { onSubmit } = this.props;
        const { text } = this.state;

        this.handleEvent(event);
        onSubmit(text);
    };

    render(): JSX.Element {
        const { className, defaultValue, textareaRef } = this.props;

        return (
            <form className={classNames('ba-ReplyForm', className)} onSubmit={this.handleSubmit}>
                <div className="ba-ReplyForm-main">
                    <textarea
                        ref={textareaRef}
                        className="ba-ReplyForm-text"
                        data-testid="ba-ReplyForm-text"
                        defaultValue={defaultValue}
                        onChange={this.handleChange}
                        onClick={this.handleEvent}
                    />
                </div>
                <div className="ba-ReplyForm-footer">
                    <Button data-testid="ba-ReplyForm-cancel" onClick={this.handleCancel} type="button">
                        <FormattedMessage {...messages.buttonCancel} />
                    </Button>
                    <PrimaryButton data-testid="ba-ReplyForm-submit" type="submit">
                        <FormattedMessage {...messages.buttonPost} />
                    </PrimaryButton>
                </div>
            </form>
        );
    }
}

export default ReplyForm;

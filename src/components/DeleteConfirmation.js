import PropTypes from 'prop-types';
import React, { Component } from 'react';

import IconTrash from 'box-react-ui/lib/icons/general/IconTrash';
import Button from 'box-react-ui/lib/components/button/Button';
import PlainButton from 'box-react-ui/lib/components/plain-button/PlainButton';
import PrimaryButton from 'box-react-ui/lib/components/primary-button/PrimaryButton';

import * as constants from '../constants';

/* eslint-disable require-jsdoc */
class DeleteConfirmation extends Component {
    static propTypes = {
        annotationID: PropTypes.string,
        message: PropTypes.string,
        cancelButton: PropTypes.string,
        deleteButton: PropTypes.string,
        onConfirmDelete: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            isDeleteConfirmationOpen: false
        };
    }

    onDelete = () => {
        this.setState({ isDeleteConfirmationOpen: true });
    };

    onCancelDelete = () => {
        this.setState({ isDeleteConfirmationOpen: false });
    };

    onConfirmDelete = () => {
        const { annotationID, onConfirmDelete } = this.props;
        onConfirmDelete(annotationID);
        this.setState({ isDeleteConfirmationOpen: false });
    };

    render() {
        const { message, cancelButton, deleteButton } = this.props;
        const { isDeleteConfirmationOpen } = this.state;

        return (
            <div data-type={constants.DATA_TYPE_DELETE_CONFIRMATION}>
                <PlainButton
                    className={`${constants.CLASS_BUTTON_PLAIN} ${constants.CLASS_DELETE_COMMENT_BTN}`}
                    onClick={this.onDelete}
                    type='button'
                >
                    <IconTrash />
                </PlainButton>
                {isDeleteConfirmationOpen ? (
                    <div className={constants.CLASS_DELETE_CONFIRMATION}>
                        <div className={constants.CLASS_DELETE_CONFIRM_MESSAGE}>{message}</div>
                        <div className={constants.CLASS_BUTTON_CONTAINER}>
                            <Button
                                className={constants.CLASS_CANCEL_DELETE_COMMENT_BTN}
                                onClick={this.onCancelDelete}
                                type='button'
                            >
                                {cancelButton}
                            </Button>
                            <PrimaryButton
                                className={constants.CLASS_CONFIRM_DELETE_COMMENT_BTN}
                                onClick={this.onConfirmDelete}
                                type='button'
                            >
                                {deleteButton}
                            </PrimaryButton>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
}

export default DeleteConfirmation;

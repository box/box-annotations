import formatTaggedMessage from 'box-react-ui/lib/features/activity-feed/utils/formatTaggedMessage';
import EventEmitter from 'events';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import * as constants from '../constants';

import DeleteConfirmation from './DeleteConfirmation';
import Profile from './Profile';

class AnnotationElement extends EventEmitter {
    /**
     * [constructor]
     *
     * @param {HTMLElement} containerEl - Container element
     * @param {Object} data - Profile data
     * @return {Profile} Instance
     */
    constructor(containerEl, data) {
        super();

        this.onConfirmDelete = data.onAnnotationDelete;

        this.containerEl = containerEl;
        this.localized = data.localized;
        this.locale = data.locale;

        this.annotation = data.annotation;
        this.permissions = this.annotation.permissions;

        this.user = this.annotation.user;
        this.userId = this.user.id || '0';

        this.createdBy = new Date(this.annotation.created).toLocaleString(this.locale, {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        if (this.annotationComponent) {
            unmountComponentAtNode(this.annotationComponent);
            this.annotationComponent = null;
        }
    }

    getUserName() {
        // Temporary until annotation user API is available
        if (this.userId === '0') {
            return this.localized.posting;
        }

        return this.user.name || this.localized.anonymousUserName;
    }

    /**
     * Renders CSV into an html table
     *
     * @return {void}
     * @private
     */
    renderAnnotation() {
        const { text, fileVersionId, annotationID } = this.annotation;
        this.annotationComponent = render(
            <div>
                <Profile {...this.user} />
                <p className={constants.CLASS_ANNOTATION_COMMENT_TEXT}>
                    {formatTaggedMessage(text, fileVersionId, true)}
                </p>
                {this.permissions.can_delete && (
                    <DeleteConfirmation
                        annotationID={annotationID}
                        message={this.localized.deleteConfirmation}
                        {...this.localized}
                    />
                )}
            </div>,
            this.containerEl
        );
    }
}

export default AnnotationElement;

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Avatar from 'box-react-ui/lib/components/avatar/Avatar';
import * as constants from '../constants';

class Profile {
    /**
     * [constructor]
     *
     * @param {HTMLElement} annotationEl - Annotation container element
     * @param {Object} data - Profile data
     * @return {Profile} Instance
     */
    constructor(annotationEl, data) {
        this.annotationEl = annotationEl;
        this.user = data;
        this.createdBy = new Date(data.createdBy).toLocaleString(data.locale, {
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
        if (this.component) {
            unmountComponentAtNode(this.csvEl);
            this.component = null;
        }
    }

    /**
     * Renders CSV into an html table
     *
     * @return {void}
     * @private
     */
    render() {
        this.component = render(<Profile user={this.user} createdBy={this.createdBy} />, this.annotationEl);
    }
}

export default Profile;

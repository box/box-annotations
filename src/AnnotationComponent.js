import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

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
        const { createdBy, locale, ...rest } = data;
        this.user = rest;
        this.createdBy = new Date(createdBy).toLocaleString(locale, {
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

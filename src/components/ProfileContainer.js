import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Avatar from 'box-react-ui/lib/components/avatar/Avatar';
import Profile from './Profile';
import * as constants from '../constants';

class ProfileContainer {
    /**
     * [constructor]
     *
     * @param {HTMLElement} annotationEl - Annotation container element
     * @param {Object} data - Profile data
     * @return {Profile} Instance
     */
    constructor(annotationEl, data) {
        this.annotationEl = annotationEl;
        this.id = data.id;
        this.name = data.name;
        this.avatarUrl = data.avatarUrl;

        this.createdBy = new Date(data.createdBy).toLocaleString(this.locale, {
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
        if (this.profileComponent) {
            unmountComponentAtNode(this.csvEl);
            this.profileComponent = null;
        }
    }

    /**
     * Renders CSV into an html table
     *
     * @return {void}
     * @private
     */
    renderProfileContainer() {
        this.profileComponent = render(
            <div>
                <Avatar
                    id={this.id}
                    name={this.name}
                    avatarUrl={this.avatarUrl}
                    className={constants.CLASS_PROFILE_IMG_CONTAINER}
                />
                <Profile name={this.name} createdBy={this.createdBy} className={constants.CLASS_PROFILE_CONTAINER} />
            </div>,
            this.annotationEl
        );
    }
}

export default ProfileContainer;

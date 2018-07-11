import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Avatar from 'box-react-ui/lib/components/avatar/Avatar';
import * as constants from '../constants';

class Profile {
    /**
     * [constructor]
     *
     * @param {HTMLElement} profileContainerEl - Profile container element
     * @param {Object} data - Profile data
     * @return {Profile} Instance
     */
    constructor(profileContainerEl, data) {
        this.profileContainerEl = profileContainerEl;
        this.id = data.id;
        this.name = data.name;
        this.avatarUrl = data.avatarUrl;
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
    renderProfile() {
        this.profileComponent = render(
            <Avatar
                id={this.id}
                name={this.name}
                avatarUrl={this.avatarUrl}
                className={constants.CLASS_PROFILE_IMG_CONTAINER}
            />,
            this.profileContainerEl
        );
    }
}

export default Profile;

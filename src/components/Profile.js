import PropTypes from 'prop-types';
import React from 'react';
import * as constants from '../constants';

/* eslint-disable require-jsdoc */
const Profile = ({ createdBy, className = '', name }) => (
    <div className={className}>
        <div className={constants.CLASS_USER_NAME}>{name}</div>
        <div className={constants.CLASS_COMMENT_DATE}>{createdBy}</div>
    </div>
);

Profile.displayName = 'Profile';
Profile.propTypes = {
    /** Url to avatar image.  If passed in, component will render the avatar image instead of the initials */
    createdBy: PropTypes.string,
    /** classname to add to the container element. */
    className: PropTypes.string,
    /** Users full name */
    name: PropTypes.string
};

export default Profile;

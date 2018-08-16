import PropTypes from 'prop-types';
import React from 'react';
import Avatar from 'box-react-ui/lib/components/avatar/Avatar';
import * as constants from '../constants';

/* eslint-disable require-jsdoc */
const ProfileContainer = ({ createdBy, name, id, avatarUrl }) => (
    <div>
        <div className={constants.CLASS_PROFILE_IMG_CONTAINER}>
            <Avatar id={id} name={name} avatarUrl={avatarUrl} />
        </div>
        <div className={constants.CLASS_PROFILE_CONTAINER}>
            <div className={constants.CLASS_USER_NAME}>{name}</div>
            <div className={constants.CLASS_COMMENT_DATE}>{createdBy}</div>
        </div>
    </div>
);

ProfileContainer.displayName = 'Profile';
ProfileContainer.propTypes = {
    /** classname to add to the container element. */
    avatarUrl: PropTypes.string,
    /** Url to avatar image.  If passed in, component will render the avatar image instead of the initials */
    createdBy: PropTypes.string,
    /** classname to add to the container element. */
    className: PropTypes.string,
    /** Users full name */
    name: PropTypes.string,
    /** Users full name */
    id: PropTypes.string
};

export default ProfileContainer;

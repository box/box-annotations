//  @flow
import * as React from 'react';
import Avatar from 'box-react-ui/lib/components/avatar';
import * as constants from '../constants';

type Props = {
    user: User,
    createdBy: Date
};

const Profile = ({ user: { id, name, avatarUrl }, createdBy }: Props): React.Node => (
    <div>
        <Avatar id={id} name={name} avatarUrl={avatarUrl} className={constants.CLASS_PROFILE_IMG_CONTAINER} />
        <div className={constants.CLASS_PROFILE_CONTAINER}>
            <div className={constants.CLASS_USER_NAME}> {name} </div>
            <div className={constants.CLASS_COMMENT_DATE}> {createdBy} </div>
        </div>
    </div>
);

export default Profile;

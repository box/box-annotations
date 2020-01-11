/**
 * @flow
 * @file avatar component
 * @author Box
 */
import * as React from 'react';
import AvatarComponent from 'box-ui-elements/es/components/avatar';

type Props = {
    className?: string,
    getAvatarUrl?: string => Promise<?string>,
    user: User,
};

type State = {
    avatarUrl: ?string,
};

class Avatar extends React.PureComponent<Props, State> {
    state = {
        avatarUrl: null,
    };

    componentDidMount() {
        this.getAvatarUrl();
    }

    /**
     * Success handler for getting avatar url
     *
     * @param {string} avatarUrl the user avatar url
     * @return {void}
     */
    getAvatarUrlHandler = (avatarUrl: ?string) => {
        this.setState({
            avatarUrl,
        });
    };

    /**
     * Gets the avatar URL for the user from the getAvatarUrl prop
     *
     * @return {Promise} a promise which resolves with the avatarUrl string
     */
    getAvatarUrl() {
        const { user, getAvatarUrl }: Props = this.props;
        if (!getAvatarUrl) {
            return Promise.resolve(user.avatarUrl).then(this.getAvatarUrlHandler);
        }

        return getAvatarUrl(user.id).then(this.getAvatarUrlHandler);
    }

    render() {
        const { user, className, getAvatarUrl }: Props = this.props;
        const { avatarUrl }: State = this.state;

        if (getAvatarUrl && !avatarUrl) {
            return null;
        }

        const { id, name } = user;

        return <AvatarComponent avatarUrl={avatarUrl} className={className} id={id} name={name} />;
    }
}

export default Avatar;

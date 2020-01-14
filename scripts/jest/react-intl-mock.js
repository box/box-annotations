import React from 'react';
import PropTypes from 'prop-types';

export const intlMock = {
    formatMessage: message => message.defaultMessage || message.message,
    formatDate: date => date,
};

export const FormattedDate = () => <div />;
FormattedDate.displayName = 'FormattedDate';

export const FormattedTime = () => <div />;
FormattedTime.displayName = 'FormattedTime';

export const FormattedMessage = () => <div />;
FormattedMessage.displayName = 'FormattedMessage';

export const IntlProvider = () => <div />;
IntlProvider.displayName = 'IntlProvider';

export const defineMessages = messages => messages;

export const intlShape = PropTypes.any;

export const addLocaleData = () => {};

export const injectIntl = Component => {
    const WrapperComponent = props => {
        const injectedProps = { ...props, intl: intlMock };
        return <Component {...{ ...injectedProps }} />;
    };
    WrapperComponent.displayName = Component.displayName || Component.name || 'Component';
    return WrapperComponent;
};

// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import { ReadableTime } from 'box-react-ui/lib/components/time';
import Tooltip from 'box-react-ui/lib/components/tooltip';

import messages from './messages';
import './Timestamp.scss';

const ONE_HOUR_MS = 3600000; // 60 * 60 * 1000

type Props = {
    time: string
};

const Timestamp = ({ time }: Props) => {
    const createdAtTimestamp = new Date(time).getTime();

    return (
        <Tooltip
            text={<FormattedMessage {...messages.annotationPostedFullDateTime} values={{ time: createdAtTimestamp }} />}
        >
            <time className='ba-annotation-created-at'>
                <ReadableTime timestamp={createdAtTimestamp} relativeThreshold={ONE_HOUR_MS} />
            </time>
        </Tooltip>
    );
};

export default Timestamp;

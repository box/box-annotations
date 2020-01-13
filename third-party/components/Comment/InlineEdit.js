/* eslint-disable jsx-quotes, react/destructuring-assignment */
/**
 * @flow
 * @file Inline Edit component
 */

import * as React from 'react';
import { injectIntl } from 'react-intl';

import PlainButton from 'box-ui-elements/es/components/plain-button';
import IconPencil from 'box-ui-elements/es/icons/general/IconPencil';

import messages from '../../messages';
import { ACTIVITY_TARGETS } from '../../interactionTargets';

type Props = {
    id: string,
    intl: any,
    toEdit: Function,
};

class InlineEdit extends React.Component<Props> {
    onEdit = (): void => {
        const { id, toEdit } = this.props;
        toEdit({ id });
    };

    render(): React.Node {
        const { onEdit } = this;
        return (
            <div className="bcs-comment-edit-container">
                <PlainButton
                    aria-label={this.props.intl.formatMessage(messages.editLabel)}
                    className="bcs-comment-edit"
                    data-resin-target={ACTIVITY_TARGETS.INLINE_EDIT}
                    onClick={onEdit}
                    type="button"
                >
                    <IconPencil />
                </PlainButton>
            </div>
        );
    }
}

export { InlineEdit as InlineEditBase };
export default injectIntl(InlineEdit);

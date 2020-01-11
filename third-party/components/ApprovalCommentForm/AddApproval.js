/**
 * @flow
 * @file AddApproval component for ApprovalCommentForm component
 */

import * as React from 'react';
import { injectIntl } from 'react-intl';

import Checkbox from 'box-ui-elements/es/components/checkbox/Checkbox';

import AddApprovalFields from './AddApprovalFields';
import { ACTIVITY_TARGETS } from '../../interactionTargets';
import messages from '../../messages';

type Props = {
    approvalDate?: Date,
    approverSelectorContacts?: SelectorItems<>,
    approverSelectorError: string,
    approvers: SelectorItems<>,
    intl: any,
    isAddApprovalVisible: boolean,
    onApprovalDateChange: Function,
    onApproverSelectorInput: Function,
    onApproverSelectorRemove: Function,
    onApproverSelectorSelect: Function,
};

const AddApproval = ({
    approvalDate,
    approvers,
    approverSelectorContacts,
    approverSelectorError,
    isAddApprovalVisible,
    onApprovalDateChange,
    onApproverSelectorInput,
    onApproverSelectorRemove,
    onApproverSelectorSelect,
    intl,
}: Props): React.Node => (
    <div className="bcs-comment-add-approver">
        <Checkbox
            className="bcs-comment-add-approver-checkbox"
            data-resin-target={ACTIVITY_TARGETS.APPROVAL_FORM_ADD_TASK}
            isChecked={isAddApprovalVisible}
            label={intl.formatMessage(messages.approvalAddTask)}
            name="addApproval"
            tooltip={intl.formatMessage(messages.approvalAddTaskTooltip)}
        />
        {isAddApprovalVisible ? (
            <AddApprovalFields
                approvalDate={approvalDate}
                approvers={approvers}
                approverSelectorContacts={approverSelectorContacts}
                approverSelectorError={approverSelectorError}
                onApprovalDateChange={onApprovalDateChange}
                onApproverSelectorInput={onApproverSelectorInput}
                onApproverSelectorRemove={onApproverSelectorRemove}
                onApproverSelectorSelect={onApproverSelectorSelect}
            />
        ) : null}
    </div>
);

export default injectIntl(AddApproval);

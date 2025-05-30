import React from "react";
import PropTypes from "prop-types";

export const ClickWrap = ({ accountId, clickwrapId, clientUserId }) => {
  return (
    <div className="form-group">
      {window.docuSignClick.Clickwrap.render(
        {
          environment: process.env.REACT_APP_DS_DEMO_SERVER,
          accountId: accountId,
          clickwrapId: clickwrapId,
          clientUserId: clientUserId
        },
        "#ds-clickwrap"
      )}
    </div>
  );
};

ClickWrap.propTypes = {
  accountId: PropTypes.string.isRequired,
  clickwrapId: PropTypes.string.isRequired,
  clientUserId: PropTypes.string.isRequired
};

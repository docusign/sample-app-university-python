import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export const ListItem = ({ item, onClick }) => {
  const { t } = useTranslation("History");

  return (
    <tr>
      <td>{item.email_subject}</td>
      <td>{item.recipients.signers[0].name}</td>
      <td>{new Date(item.status_changed_date_time).toDateString()}</td>
      <td className="text-right">
        <div className="dropdown">
          <button
             className="dropdown-toggle btn btn-secondary"
              type="button"
              id="options3"
              data-bs-toggle="dropdown"
              aria-expanded="false"
          >
            {t("OptionsButton")}
          </button>
          <div
            className="dropdown-menu dropdown-menu-right"
            aria-labelledby="options3"
          >
            <a href="#/"
              className="dropdown-item"
              onClick={() =>
                onClick({
                  envelopeId: item.envelope_id,
                  documentId: "1",
                  extention: "pdf",
                  mimeType: "application/pdf"
                })
              }
            >
              {t("HTMLOptionButton")}
            </a>
            <a href="#/"
              className="dropdown-item"
              onClick={() =>
                onClick({
                  envelopeId: item.envelope_id,
                  documentId: "certificate",
                  extention: "pdf",
                  mimeType: "application/pdf"
                })
              }
            >
              {t("SummaryOptionButton")}
            </a>
            <a href="#/"
              className="dropdown-item"
              onClick={() =>
                onClick({
                  envelopeId: item.envelope_id,
                  documentId: "combined",
                  extention: "pdf",
                  mimeType: "application/pdf"
                })
              }
            >
              {t("CombinedOptionButton")}
            </a>
          </div>
        </div>
      </td>
    </tr>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
};
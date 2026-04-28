import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const formatTimestamp = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toISOString();
};

export const ListItem = ({ item, onClick }) => {
  const { t } = useTranslation("History");
  const [open, setOpen] = React.useState(false);
  const [eventsOpen, setEventsOpen] = React.useState(false);
  const ref = React.useRef(null);

  const toggle = () => setOpen(prev => !prev);
  const close = () => setOpen(false);
  const toggleEvents = () => setEventsOpen(prev => !prev);

  React.useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        close();
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleItemClick = (e, payload) => {
    e.preventDefault();
    // close first so UI updates immediately
    close();
    onClick(payload);
  };

  return (
    <>
      <tr className={`history-row ${eventsOpen ? "history-row-expanded" : ""}`}>
        <td>{item.signerName}</td>
        <td>{item.subject}</td>
        <td>{item.status}</td>
        <td>{formatTimestamp(item.statusTimestamp)}</td>
        <td className="text-right">
          <div className={`dropdown ${open ? "show" : ""}`} ref={ref}>
            <button
              type="button"
              className="btn btn-secondary dropdown-toggle"
              id={`options-${item.envelopeId}`}
              aria-haspopup="true"
              aria-expanded={open}
              onClick={toggle}
            >
              {t("OptionsButton")}
            </button>

            <div
              className={`dropdown-menu dropdown-menu-right ${open ? "show" : ""}`}
              aria-labelledby={`options-${item.envelopeId}`}
            >
              <a
                href="#/"
                className="dropdown-item"
                onClick={(e) =>
                  handleItemClick(e, {
                    envelopeId: item.envelopeId,
                    documentId: "1",
                    extention: "pdf",
                    mimeType: "application/pdf"
                  })
                }
              >
                {t("HTMLOptionButton")}
              </a>

              <a
                href="#/"
                className="dropdown-item"
                onClick={(e) =>
                  handleItemClick(e, {
                    envelopeId: item.envelopeId,
                    documentId: "certificate",
                    extention: "pdf",
                    mimeType: "application/pdf"
                  })
                }
              >
                {t("SummaryOptionButton")}
              </a>

              <a
                href="#/"
                className="dropdown-item"
                onClick={(e) =>
                  handleItemClick(e, {
                    envelopeId: item.envelopeId,
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
        <td className="text-right">
          <div className="history-row__actions">
            <button
              type="button"
              className="history-row__toggle"
              aria-expanded={eventsOpen}
              aria-controls={`events-${item.envelopeId}`}
              onClick={toggleEvents}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-down-fill"
                viewBox="0 0 16 16"
              >
                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
              </svg>
            </button>
          </div>
        </td>
      </tr>

      <tr
        id={`events-${item.envelopeId}`}
        className={`history-events-row ${eventsOpen ? "is-open" : ""}`}
        hidden={!eventsOpen}
      >
        <td colSpan="6" className="history-events-row__cell">
          <div className="history-events-panel">
            <div className="history-events-panel__header">
              {t("EventsListTitle")}
            </div>
            <table className="table history-events-table mb-0">
              <thead>
                <tr>
                  <th scope="col">{t("EventAppName")}</th>
                  <th scope="col">{t("EventVerified")}</th>
                  <th scope="col">{t("EventType")}</th>
                  <th scope="col">{t("EventTimestamp")}</th>
                </tr>
              </thead>
              <tbody>
                {item?.extensionEvents?.length > 0 ? (
                  item.extensionEvents.map(event => (
                    <tr key={event.id}>
                      <td>{event.appName}</td>
                      <td>
                        <span
                          className={`history-events-table__verified history-events-table__verified-${event.verified}`}
                        >
                          {event.verified ? "true" : "false"}
                        </span>
                      </td>
                      <td>{event.actionContract}</td>
                      <td>{formatTimestamp(event.attemptTime)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="history-events-table__empty">
                      {t("EventsLoading")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    </>
  );
};

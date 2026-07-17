import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import LoggedUserContext from "../../contexts/logged-user/logged-user.context";

const formatTimestamp = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toISOString();
};

export const ListItem = ({ item, onClick }) => {
  const { t } = useTranslation("History");
  const { authType } = React.useContext(LoggedUserContext);
  const [open, setOpen] = React.useState(false);
  const [eventsOpen, setEventsOpen] = React.useState(false);
  const [menuStyle, setMenuStyle] = React.useState({});
  const ref = React.useRef(null);
  const buttonRef = React.useRef(null);

  const envelopeId = item.envelopeId || item.envelope_id;
  const subject = item.subject || item.email_subject;
  const signerName = item.signerName || item?.recipients?.signers?.[0]?.name || "--";
  const status = item.status || "--";
  const statusTimestamp = item.statusTimestamp || item.status_changed_date_time;
  const extensionEvents = item.extensionEvents || [];

  const updateMenuPosition = React.useCallback(() => {
    if (!buttonRef.current) {
      return;
    }

    const menuWidth = 240;
    const menuHeight = 160;
    const viewportPadding = 8;
    const buttonRect = buttonRef.current.getBoundingClientRect();

    const left = Math.max(
      viewportPadding,
      Math.min(buttonRect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding)
    );

    const hasSpaceBelow = window.innerHeight - buttonRect.bottom >= menuHeight;
    const top = hasSpaceBelow
      ? buttonRect.bottom + 4
      : Math.max(viewportPadding, buttonRect.top - menuHeight - 4);

    setMenuStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      minWidth: `${menuWidth}px`,
      zIndex: 1080
    });
  }, []);

  const toggle = () => {
    setOpen(prev => {
      const next = !prev;
      if (next) {
        updateMenuPosition();
      }
      return next;
    });
  };
  const close = () => setOpen(false);
  const toggleEvents = () => setEventsOpen(prev => !prev);

  React.useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        close();
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") {
        close();
      }
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

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleViewportChange = () => updateMenuPosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, updateMenuPosition]);

  const handleItemClick = (e, payload) => {
    e.preventDefault();
    close();
    onClick(payload);
  };

  return (
    <>
      <tr>
        <td>{signerName}</td>
        <td>{subject}</td>
        <td>{status}</td>
        <td>{formatTimestamp(statusTimestamp)}</td>
        <td className="text-right">
          <div className={`dropdown ${open ? "show" : ""}`} ref={ref}>
            <button
              ref={buttonRef}
              className="dropdown-toggle btn btn-secondary"
              type="button"
              id={`options-${envelopeId}`}
              aria-haspopup="true"
              aria-expanded={open}
              onClick={toggle}
            >
              {t("OptionsButton")}
            </button>
            <div
              className={`dropdown-menu dropdown-menu-right ${open ? "show" : ""}`}
              aria-labelledby={`options-${envelopeId}`}
              style={open ? menuStyle : undefined}
            >
              <a
                href="#/"
                className="dropdown-item"
                onClick={(e) =>
                  handleItemClick(e, {
                    envelopeId,
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
                    envelopeId,
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
                    envelopeId,
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
          {authType === "jwt" && (
            <button
              type="button"
              className="btn btn-link p-0"
              aria-expanded={eventsOpen}
              aria-controls={`events-${envelopeId}`}
              onClick={toggleEvents}
            >
              <span aria-hidden="true">...</span>
            </button>
          )}
        </td>
      </tr>

      <tr id={`events-${envelopeId}`} hidden={!eventsOpen}>
        <td colSpan="6">
          <div>
            <strong>{t("EventsListTitle")}</strong>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th scope="col">{t("EventAppName")}</th>
                  <th scope="col">{t("EventVerified")}</th>
                  <th scope="col">{t("EventType")}</th>
                  <th scope="col">{t("EventTimestamp")}</th>
                </tr>
              </thead>
              <tbody>
                {extensionEvents.length > 0 ? (
                  extensionEvents.map((event, index) => (
                    <tr key={`${event.id || event.attemptTime || "event"}-${index}`}>
                      <td>{event.appName || event.app_name || "--"}</td>
                      <td>{String(event.verified)}</td>
                      <td>{event.actionContract || event.action_contract || "--"}</td>
                      <td>{formatTimestamp(event.attemptTime || event.attempt_time)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
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

ListItem.propTypes = {
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
};
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import parse from "html-react-parser";

export const SigningComplete = () => {
  const { t } = useTranslation("SigningComplete");

  if (window.top !== window.self) {
    window.top.location.href =
      process.env.REACT_APP_DS_RETURN_URL + "/signing_complete";
  }

  return (
    <section className="container content-section">
      <div className="row">
        <div className="col-md-6">
          <h2 className="text-center">{t("Title")}</h2>
          {parse(t("SigningMessage"))}
          <div className="">
            <br></br>
            <div>
              <Link className="link" to="/">
                {t("BackLink")}
              </Link>
            </div>
            <br></br>
            <div>
              <Link className="link" to="/history">
                {t("StatusLink")}
              </Link>
            </div>
            <br></br>
          </div>

          <div className="action-section text-center">
            <div className="row">
              <div className="col-md-10 col-md-offset-1">
                {parse(t("SandboxText"))}
                <br></br>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 col-md-offset-3">
                <a
                  href="https://go.docusign.com/o/sandbox/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    className="btn btn-danger"
                    style={{
                      position: "absolute",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {t("SandboxButton")}
                  </button>
                </a>
                <br></br>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">{parse(t("Description"))}</div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <br></br>
          <h4>{t("SigningReturnEvents")}</h4>
          <p>
            <strong> {t("SigningCompleteEvent.Name")}</strong>
            <br></br>
            {t("SigningCompleteEvent.Decription")}
          </p>
          <div>
            <p>
              <strong>{t("CancelEvent.Name")}</strong>
              <br></br>
              {parse(t("CancelEvent.Decription"))}
            </p>

            <p>
              <strong>{t("DeclineEvent.Name")}</strong>
              <br></br>
              {t("DeclineEvent.Decription")}
            </p>

            <p>
              <strong>{t("ExceptionEvent.Name")}</strong>
              <br></br>
              {t("ExceptionEvent.Decription")}
            </p>

            <p>
              <strong>{t("FaxPendingEvent.Name")}</strong>
              <br></br>
              {t("FaxPendingEvent.Decription")}
            </p>

            <p>
              <strong>{t("SessionTimeoutEvent.Name")}</strong>
              <br></br>
              {t("SessionTimeoutEvent.Decription")}
            </p>

            <p>
              <strong>{t("TtlExpiredEvent.Name")}</strong>
              <br></br>
              {t("TtlExpiredEvent.Decription")}
            </p>

            <p>
              <strong>{t("ViewingCompleteEvent.Name")}</strong>
              <br></br>
              {t("ViewingCompleteEvent.Decription")}
            </p>

            <p>
              <a
                href="https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/embedding/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("LearnAbout")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

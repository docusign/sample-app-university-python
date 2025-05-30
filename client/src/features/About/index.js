import React from "react";
import { useTranslation } from "react-i18next";
import parse from "html-react-parser";

export const About = () => {
  const { t } = useTranslation("About");
  return (
    <div className="container">
      <br></br>

      <h2 id="sample-app">{t("Title")}</h2>
      <blockquote>{parse(t("Description"))}</blockquote>
      <p>
        <strong>
          <a
            target="_blank"
            href={t("GitHubLink")}
            rel="noopener noreferrer"
          >
            {t("SourceButton")}
          </a>
        </strong>
      </p>
      <br></br>
      <div className="row">
        <div className="col-md-6">
          {parse(t("Features"))}
        </div>
        <div className="col-md-6">
          <h3>{t("ToolsandLinks")}</h3>
          <p>
            <a
              target="_blank"
              href={t("DeveloperCenterLink")}
              rel="noopener noreferrer"
            >
              <strong>{t("DeveloperCenter")}</strong>
            </a>
          </p>
          <p>
            <a
              target="_blank"
              href={t("APICodeExamplesLink")}
              rel="noopener noreferrer"
            >
              <strong>{t("APICodeExamples")}</strong>
            </a>
          </p>
          <p>
            <a
              target="_blank"
              href={t("ESignatureDocumentationLink")}
              rel="noopener noreferrer"
            >
              <strong>{t("ESignatureDocumentation")}</strong>
            </a>
          </p>
          <p>
            <a
              target="_blank"
              href={t("DeveloperCommunityLink")}
              rel="noopener noreferrer"
            >
              <strong>{t("DeveloperCommunity")}</strong>
            </a>
          </p>
        </div>
      </div>

      <br></br>
    </div>
  );
};

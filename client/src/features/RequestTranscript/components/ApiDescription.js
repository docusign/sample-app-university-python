import React from "react";
import { useTranslation } from "react-i18next";
import parse from "html-react-parser";
import { Collapse } from 'react-bootstrap'

export const ApiDescription = () => {
  const { t } = useTranslation("RequestTranscript");
  const [open, setOpen] = React.useState(false);

  return (
    <div className="col-lg-6 pt-5 pb-4">
      <div id="accordion">
        <div className="card">
          <div className="card-header" id="headingOne">
            <h5 className="mb-0">
              <button
                className="btn btn-link"
                data-toggle="collapse"
                data-target="#collapseOne"
                aria-expanded="false"
                aria-controls="collapseOne"
                onClick={() => {setOpen(!open)}}
              >
                {t("ApiDecription.SeeMore")}
              </button>
            </h5>
          </div>
          <div
            id="collapseOne"
            aria-labelledby="headingOne"
            data-parent="#accordion"
          >
            <Collapse in={open}>
              <div className="card-body">
                {parse(t("ApiDecription.CodeFlow"))}
              </div>
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { InputText } from "../../../components/InputText";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { ClickWrap } from "./Clickwrap";
import { LoadClickwrapApi } from "./LoadClickwrapApi";

export const RequestForm = ({
  request,
  onSave,
  onChange,
  clickwrap,
  requesting = false,
  errors = {}
}) => {
  const [clickApiReady, setClickApiReady] = useState(false);
  useEffect(() => {
    LoadClickwrapApi(() => {
      setClickApiReady(true);
    });
  }, []);
  const { t } = useTranslation("RequestTranscript");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="col-lg-6">
      <div className="form-holder bg-white pt-5 pb-5">
        <h2 className="mb-4">{t("Title")}</h2>
        <form
          onSubmit={event => {
            onSave(event);
            setSubmitted(true);
          }}
          className={submitted ? "was-validated" : ""}
          noValidate
        >
          {errors.onSave && (
            <div className="alert alert-danger mt-2">{errors.onSave}</div>
          )}
          <InputText
            name="firstName"
            label={t("FirstName")}
            value={request.firstName}
            onChange={onChange}
            error={errors.firstName}
          />
          <InputText
            name="lastName"
            label={t("LastName")}
            value={request.lastName}
            onChange={onChange}
            error={errors.lastName}
          />
          <InputText
            name="email"
            label={t("Email")}
            value={request.email}
            onChange={onChange}
            error={errors.email}
          />
          <div id="ds-clickwrap"></div>
          {clickwrap && clickApiReady && request.email ? (
            <ClickWrap
              accountId={clickwrap.accountId}
              clickwrapId={clickwrap.clickwrapId}
              clientUserId={request.email}
            />
          ) : null}
          <div id="ds-clickwrap-preview"></div>

          <div className="text-center">
            <button
              type="submit"
              disabled={requesting}
              className="btn btn-danger"
            >
              {requesting ? t("SubmitButtonClicked") : t("SubmitButton")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
RequestForm.propTypes = {
  request: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  requesting: PropTypes.bool
};

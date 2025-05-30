import React, { useState } from "react";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export const RequestForm = ({
  request,
  courses,
  onSave,
  onChange,
  onSelect,
  requesting = false,
  errors = {}
}) => {
  const { t } = useTranslation("RequestMajorMinor");
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
          <InputSelect
            name="majorField"
            label={t("MajorField")}
            defaultOption={request.majorField || ""}
            options={courses.map(course => ({
              text: course
            }))}
            onChange={onSelect}
            error={errors.majorField}
          />
          <InputSelect
            name="minorField"
            label={t("MinorField")}
            defaultOption={request.minorField || ""}
            options={courses.map(course => ({
              text: course
            }))}
            onChange={onSelect}
            error={errors.minorField}
          />
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
        <div className="text-center form-text">
          <span>{t("SubmitInfo")}</span>
        </div>
      </div>
    </div>
  );
};
RequestForm.propTypes = {
  request: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  requesting: PropTypes.bool,
  courses: PropTypes.array.isRequired
};

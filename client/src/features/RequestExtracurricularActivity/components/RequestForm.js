import React, { useState } from "react";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export const RequestForm = ({
  request,
  activities,
  onSave,
  onChange,
  onSelect,
  requesting = false,
  errors = {}
}) => {
  const { t } = useTranslation("RequestExtracurricularActivity");
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
            <div className="alert alert-danger mt-2">
              <p>{errors.onSave}</p>
            </div>
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
            name="activity"
            label={t("Activity")}
            options={activities.map(activity => ({
              text: `${activity.category} - ${activity.name} ($${activity.price})`
            }))}
            onChange={onSelect}
            error={errors.activity}
          />
          <p className="list-group-item d-flex justify-content-between">
            <span>{t("Total")}</span>
            <strong>{request.activity.price}</strong>
          </p>
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
  activities: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  requesting: PropTypes.bool
};

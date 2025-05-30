import React, { useState, useReducer, useContext, useEffect } from "react";
import { RequestForm } from "./components/RequestForm";
import { ApiDescription } from "./components/ApiDescription";
import { reducer } from "./requestReducer";
import { Frame } from "../../components/Frame.js";
import { SEND_REQEUST_SUCCESS } from "./actionTypes";
import * as studentsAPI from "../../api/studentsAPI";
import { useTranslation } from "react-i18next";
import LoggedUserContext from "../../contexts/logged-user/logged-user.context";
import { checkUnlogged } from "../../api/auth";

const initialState = {
  errors: [],
  request: {
    firstName: "",
    lastName: "",
    email: "",
    activity: ""
  }
};

export const RequestExtracurricularActivityPage = () => {
  const { t } = useTranslation("RequestExtracurricularActivity");
  const [state, dispatch] = useReducer(reducer, initialState);
  const [request, setRequestData] = useState({ ...initialState.request });
  const [errors, setErrors] = useState({});
  const activities = t("Activities", { returnObjects: true });
  const { logged, setLogged, setAuthType, setShowJWTModal } = useContext(LoggedUserContext);

  useEffect(() => {
    checkUnlogged(logged, setLogged, setAuthType);
  });

  async function handleSave(event) {
    event.preventDefault();
    if (!formIsValid()) {
      return;
    }
    const body = {
      "callback-url": process.env.REACT_APP_DS_RETURN_URL + "/signing_complete",
      student: {
        first_name: request.firstName,
        last_name: request.lastName,
        email: request.email
      },
      activity: {
        name: `${request.activity.category} - ${request.activity.name}`,
        price: request.activity.price
      }
    };

    try {
      const savedRequest = await studentsAPI.signUpForExtracurricularActivity(
        body,
        setShowJWTModal
      );
      dispatch({
        type: SEND_REQEUST_SUCCESS,
        payload: {
          envelopeId: savedRequest.envelope_id,
          redirectUrl: savedRequest.redirect_url
        }
      });
    } catch (error) {
      setErrors({ ...errors, onSave: error.message });
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const { [name]: removed, ...updatedErrors } = errors;
    setErrors(updatedErrors);
    setRequestData(request => ({
      ...request,
      [name]: value
    }));
  }

  function handleSelect(event) {
    const { name, value } = event.target;
    const { [name]: removed, ...updatedErrors } = errors;
    setErrors(updatedErrors);
    setRequestData(request => ({
      ...request,
      [name]: activities[value]
    }));
  }

  function formIsValid() {
    const { firstName, lastName, email, activity } = request;
    const errors = {};
    if (!firstName) {
      errors.firstName = t("Error.FirstName");
    }
    if (!lastName) {
      errors.lastName = t("Error.LastName");
    }
    if (!email || !(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email))) {
      errors.email = t("Error.Email");
    }
    if (!activity) {
      errors.activity = t("Error.Activity");
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  }

  if (!state.redirectUrl) {
    return (
      <section className="container content-section">
        <div className="row">
          <RequestForm
            request={request}
            activities={activities}
            onChange={handleChange}
            onSave={handleSave}
            errors={errors}
            onSelect={handleSelect}
          />
          <ApiDescription />
        </div>
      </section>
    );
  } else {
    return <Frame src={state.redirectUrl} />;
  }
};
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
    majorField: "",
    minorField: ""
  }
};

export const RequestMajorMinorChangePage = () => {
  const { t } = useTranslation("RequestMajorMinor");
  const [state, dispatch] = useReducer(reducer, initialState);
  const [request, setRequestData] = useState({ ...initialState.request });
  const [requesting, setRequesting] = useState(false);
  const [errors, setErrors] = useState({});
  const courses = t("Courses", { returnObjects: true });
  const { logged, setLogged, setAuthType } = useContext(LoggedUserContext);

  useEffect(() => {
    checkUnlogged(logged, setLogged, setAuthType);
  })

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
        email: request.email,
        major: request.majorField,
        minor: request.minorField
      }
    };
    setRequesting(true);
    try {
      const savedRequest = await studentsAPI.requestMinorChange(body);
      dispatch({
        type: SEND_REQEUST_SUCCESS,
        payload: {
          envelopeId: savedRequest.envelope_id,
          redirectUrl: savedRequest.redirect_url
        }
      });
    } catch (error) {
      setErrors({ ...errors, onSave: error.message });
    } finally {
      setRequesting(false);
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
      [name]: courses[value]
    }));
  }

  function formIsValid() {
    const { firstName, lastName, email, majorField, minorField } = request;
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
    if (!majorField && !minorField) {
      errors.majorField = t("Error.MajorField");
      errors.minorField = t("Error.MinorField");
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
            courses={courses}
            requesting={requesting}
            onChange={handleChange}
            onSelect={handleSelect}
            onSave={handleSave}
            errors={errors}
          />
          <ApiDescription />
        </div>
      </section>
    );
  } else {
    return <Frame src={state.redirectUrl} />;
  }
};
import React, { useState, useReducer, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { RequestForm } from "./components/RequestForm";
import { ApiDescription } from "./components/ApiDescription";
import { reducer } from "./requestReducer";
import * as studentsAPI from "../../api/studentsAPI";
import * as Actions from "./actionTypes";
import { download } from "../../api/download";
import LoggedUserContext from "../../contexts/logged-user/logged-user.context";
import { checkUnlogged } from "../../api/auth";

const initialState = {
  errors: [],
  request: {
    firstName: "",
    lastName: "",
    email: ""
  },
  clickwrap: null
};

export const RequestTranscriptPage = () => {
  const { t } = useTranslation("RequestTranscript");
  const [state, dispatch] = useReducer(reducer, initialState);
  const [request, setRequestData] = useState({ ...initialState.request });
  const [requesting, setRequesting] = useState(false);
  const [errors, setErrors] = useState({});
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
      "terms-name": t("Transcript.TermsName"),
      "terms-transcript": t("Transcript.DisplayName"),
      "display-name": t("Transcript.TermsTranscript")
    };
    setRequesting(true);
    try {
      const response = await studentsAPI.getCliwrapForRequestTranscript(body);
      dispatch({
        type: Actions.GET_CLICKWRAP_SUCCESS,
        payload: {
          clickwrap: response.clickwrap,
          envelopeId: response.envelope_id,
          redirectUrl: response.redirect_url
        }
      });
      window.addEventListener(
        "message",
        event => getTranscript(event, response.clickwrap),
        false
      );
    } catch (error) {
      setRequesting(false);
      setErrors({ ...errors, onSave: error.message });
    } 
  }

  async function getTranscript(event, clickwrap) {
    if (event.data.type === "HAS_AGREED") {
      const body = {
        clickwrap_id: clickwrap.clickwrapId,
        client_user_id: request.email,
        student: {
          first_name: request.firstName,
          last_name: request.lastName
        }
      };
      try {
        
        const response = await studentsAPI.requestTranscript(body);
        download(response, "transcript", "html", "text/html");

        window.addEventListener(
          "message",
          event => {
            if(event.data.type == "DOWNLOADED"){
              setTimeout(() => {
                goToSigningComplete(event);
              }, 10000);
            } else {
              goToSigningComplete(event);
            }
          },
          false
        );
      } catch (error) {
        throw error;
      }
    }
  }

  function goToSigningComplete(event) {
      window.top.location.href =
        process.env.REACT_APP_DS_RETURN_URL + "/signing_complete";
  }

  function handleChange(event) {
    const { name } = event.target;
    const { [name]: removed, ...updatedErrors } = errors;
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setErrors(updatedErrors);
    setRequestData(request => ({
      ...request,
      [name]: value
    }));
  }

  function formIsValid() {
    const { firstName, lastName, email } = request;
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
    setErrors(errors);
    return Object.keys(errors).length === 0;
  }

  return (
    <section className="container content-section">
      <div className="row">
        <RequestForm
          request={request}
          requesting={requesting}
          onChange={handleChange}
          onSave={handleSave}
          errors={errors}
          clickwrap={state.clickwrap}
        />
        <ApiDescription />
      </div>
    </section>
  );
};

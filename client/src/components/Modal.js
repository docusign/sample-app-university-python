import React, { useState, useContext } from "react";
import { Modal, Container, Button } from "react-bootstrap";
import { InputRadio } from "./InputRadio";
import { useTranslation } from "react-i18next";
import { codeGrantAuth, jwtAuth, getStatus } from "../api/auth";
import parse from "html-react-parser";
import LoggedUserContext from "../contexts/logged-user/logged-user.context";
import { useNavigate } from "react-router-dom";


const initialState = {
    errors: [],
    request: {
      loginOption: ""
    }
  };

export const Login = (props) => {
    const [request, setRequestData] = useState({ ...initialState.request });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const { redirectUrl, setLogged, setAuthType } = useContext(LoggedUserContext);
    const { t } = useTranslation("Modal");
    const loginOptions = t("LoginOptions", { returnObjects: true });
    const navigate = useNavigate();

    function handleChange(event) {
        const { name, value } = event.target;
        const { [name]: removed, ...updatedErrors } = errors;
        setSubmitted(false);
        setErrors(updatedErrors);
        setRequestData(request => ({
          ...request,
          [name]: loginOptions[value]
        }));
    }
    
    async function handleClick(event) {
        event.preventDefault();
        if (!formIsValid()) {
            setSubmitted(true);
            return;
        }

        try {
            if (request.loginOption === loginOptions[0]) {
                await codeGrantAuth(redirectUrl);
            } else if (request.loginOption === loginOptions[1]){
                await jwtAuth(navigate);
                await getStatus(setLogged, setAuthType);
                navigate(redirectUrl);
                handleClose();
            }
        } catch(error) {
            if (!error.response || error.response.status !== 401) {
                const errors = {};
                errors.onLogin = error.message;
                setErrors(errors);
            }
        }
    }

    function formIsValid() {
        const { loginOption } = request;
        const errors = {};

        if (!loginOption) {
            errors.loginOption = t("ValidateMessage");
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    function handleClose() {
        props.onHide();
        setSubmitted(false);
        setRequestData(request => ({
            ...request,
            loginOption: ""
          }));
          setErrors({});
    }

    return (
        <Modal {...props} onHide={() => handleClose()} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {t("ModalTitle")}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Container>
                    {errors.onLogin && (
                        <div className="alert alert-danger mt-2">{errors.onLogin}</div>
                    )}
                    <h5>{parse(t("HelpMeToDecide"))}</h5>

                    <div className="form-holder bg-white">
                        <form
                        className={submitted ? "was-validated": ""}
                        noValidate
                        >
                            <InputRadio
                                options={loginOptions.map(option => ({
                                    text: option
                                }))}
                                onChange={handleChange}
                                error={errors.loginOption}
                                value={request.loginOption}
                                name={"loginOption"}
                            />
                    </form>
                    </div>
                        <h5>{parse(t("Warning"))}</h5>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={event => handleClick(event)}>{t("LoginButton")}</Button>
                <Button variant="outline-danger" onClick={() => handleClose()}>{t("CloseButton")}</Button>
            </Modal.Footer>
        </Modal>
    )
}
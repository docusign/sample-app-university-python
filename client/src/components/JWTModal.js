import React, { useState, useContext } from "react";
import { Modal, Container, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { jwtAuth, logOut, getStatus } from "../api/auth";
import parse from "html-react-parser";
import LoggedUserContext from "../contexts/logged-user/logged-user.context";
import { useNavigate } from "react-router-dom";

export const LoginWithJWT = props => {
    const [errors, setErrors] = useState({});
    const { setLogged, setAuthType } = useContext(LoggedUserContext);
    const { t } = useTranslation("JWTModal");
    const navigate = useNavigate();

    async function handleClick(event) {
        event.preventDefault();
        try {
            await logOut();
            await jwtAuth(navigate);
            await getStatus(setLogged, setAuthType);
            handleClose();
        } catch (error) {
            const errors = {};
            errors.onLogin = error.message;
            setErrors(errors);
        }
    };

    function handleClose() {
        props.onHide();
        setErrors({});
    };

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

                    <h5>{parse(t("Warning"))}</h5>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn btn-danger" onClick={event => handleClick(event)}>{t("LoginButton")}</Button>
                <Button className="btn btn-secondary" onClick={() => handleClose()}>{t("CloseButton")}</Button>
            </Modal.Footer>
        </Modal>
    )
}
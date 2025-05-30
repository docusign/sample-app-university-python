import React, { useEffect, useContext } from "react";
import { completeCallback } from "../api/auth";
import LoggedUserContext from "../contexts/logged-user/logged-user.context";
import { useNavigate } from "react-router-dom";

export const Callback = () => {
    const { setLogged, setAuthType, setShowAlert, setShowJWTModal } = useContext(LoggedUserContext); 
    const navigate = useNavigate();
    useEffect(() => {
        completeCallback(setShowAlert, setLogged, setAuthType, setShowJWTModal, navigate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    return (
        <>
        </>
    )
}
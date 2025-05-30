import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

export const Logout = ({ handleLogOut }) => {
    useEffect(() => {
        handleLogOut();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <Navigate to="/"/>
}
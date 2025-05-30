import React, { useState, useContext } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Login } from "./Modal"
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { LoginWithJWT } from "./JWTModal";
import ModalContext from "../contexts/modal/modal.context";
import LoggedUserContext from "../contexts/logged-user/logged-user.context";
import Alert from "react-bootstrap/Alert";
import parse from "html-react-parser";

const Layout = props => {
  const { t } = useTranslation("Common");
  const { showAlert, setShowAlert, showJWTModal, setShowJWTModal } = useContext(LoggedUserContext);
  const [ modalShow, setModalShow ] = useState(false);

  return (
    <>
      <Helmet>
        <title>{t("ApplicationName")}</title>
        <meta name="description" content={t("MetaDescription")}/>
      </Helmet>

      <ModalContext.Provider value={{ modalShow, setModalShow }}>
        <Header />
        <Alert show={showAlert} variant="warning" onClose={() => setShowAlert(false)} dismissible>
          <Alert.Heading>{parse(t("AlertMessage"))}</Alert.Heading>
        </Alert>
        <main role="main" className="content">
          {props.children}
          <Login
            show={modalShow}
            onHide={() => setModalShow(false)}/>
          
          <LoginWithJWT 
            show={showJWTModal}
            onHide={() => setShowJWTModal(false)}
          />
        </main>
      </ModalContext.Provider>
      <Footer />
    </>
  );
};

export default Layout;

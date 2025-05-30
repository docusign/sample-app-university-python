import React, { Suspense, useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { Logout } from "./components/Logout";
import { About } from "./features/About";
import { History } from "./features/History";
import { Home } from "./features/Home";
import { RequestMajorMinorChangePage } from "./features/RequestMajorMinorChange";
import { RequestTranscriptPage } from "./features/RequestTranscript";
import { RequestExtracurricularActivityPage } from "./features/RequestExtracurricularActivity";
import { SigningComplete } from "./components/SigningComplete.js";
import { logOut, getStatus } from "./api/auth";
import { Callback } from "./components/Callback";
import "./assets/scss/main.scss";
import LoggedUserContext from "./contexts/logged-user/logged-user.context";


const App = () => {
  const [ logged, setLogged ] = useState(false);
  const [ redirectUrl, setRedirectUrl ] = useState("/");
  const [ showAlert, setShowAlert ] = useState(false);
  const [ showJWTModal, setShowJWTModal] = useState(false);
  const [ authType, setAuthType ] = useState(undefined);

  useEffect(() => {
    getStatus(setLogged, setAuthType);
  }, []);

  async function handleLogOut() {
    await logOut();
    getStatus(setLogged, setAuthType);
  }

  const routes = (
    <Routes>
      <Route path="/history" element={<History/>} />
      <Route path="/about" element={<About/>} />
      <Route
        path="/requestMajorMinorChange"
        element={<RequestMajorMinorChangePage/>}
      />
      <Route path="/requestTranscript" element={<RequestTranscriptPage/>} />
      <Route
        path="/requestExtracurricularActivity"
        element={<RequestExtracurricularActivityPage/>}
      />
      <Route path="/" exact element={<Home/>} />
      <Route path="/signing_complete" element={<SigningComplete/>} />
      <Route path="/callback" element={<Callback/>}/>
      <Route path="/logout" element={<Logout handleLogOut={handleLogOut}/>} />
    </Routes>
  );

  return (
    <Suspense fallback="">
      <LoggedUserContext.Provider value={{ logged, setLogged, redirectUrl, setRedirectUrl, 
                                          showAlert, setShowAlert, showJWTModal, setShowJWTModal, 
                                          authType, setAuthType}}>
        <Layout>{routes}</Layout>
      </LoggedUserContext.Provider>
    </Suspense>
  );
};

export default App;
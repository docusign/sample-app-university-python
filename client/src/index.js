import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Router } from "react-router-dom";
import App from "./App";
import history from "./api/history";
import "./i18n";
import "@popperjs/core";
import "bootstrap/dist/js/bootstrap.js";

const container = document.getElementById("root");

const root = ReactDOM.createRoot(container);

const app = (
  <BrowserRouter history={history}>
    <App />
  </BrowserRouter>
);

root.render(app);

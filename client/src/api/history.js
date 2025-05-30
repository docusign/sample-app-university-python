import { createBrowserHistory as createHistory } from "history";

export default createHistory({
  basename: process.env.NODE_ENV === "development" ? "" : ""
});
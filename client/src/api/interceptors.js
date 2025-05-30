import axios from "axios";

axios.interceptors.response.use(
  response => {
    return response;
  },
  function(error) {
    if (error.response && error.response.status === 401) {
      window.location.href = error.response.data.url;
    }
    return Promise.reject(error);
  }
);

export default axios;
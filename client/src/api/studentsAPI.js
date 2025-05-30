import axios from "./interceptors";
import { handleResponse, handleError } from "./apiHelper";

export async function requestMinorChange(request) {
  try {
    const response = await axios.post(
      process.env.REACT_APP_API_BASE_URL + "/requests/minormajor",
      request,
      {
        withCredentials: true
      }
    );
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
}

export async function signUpForExtracurricularActivity(request) {
  try {
    const response = await axios.post(
      process.env.REACT_APP_API_BASE_URL + "/requests/activity",
      request,
      {
        withCredentials: true
      }
    );
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
}

export async function requestTranscript(request) {
  try {
    const response = await axios.post(
      process.env.REACT_APP_API_BASE_URL + "/requests/transcript",
      request,
      {
        withCredentials: true
      }
    );
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
}

export async function getStatus(fromDate) {
  try {
    const response = await axios.get(
      process.env.REACT_APP_API_BASE_URL + "/requests",
      {
        params: {
          "from-date": fromDate
        },
        withCredentials: true
      }
    );
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
}

export async function getStatusDocument(envelopId, documentId) {
  try {
    const response = await axios.get(
      process.env.REACT_APP_API_BASE_URL + "/requests/download",
      {
        params: {
          "envelope-id": envelopId,
          "document-id": documentId
        },
        withCredentials: true,
        responseType: "blob"
      }
    );
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
}

export async function getCliwrapForRequestTranscript(request) {
  console.log("getCliwrapForRequestTranscript called with request:", request); // Log input request
  
  try {
    const apiUrl = process.env.REACT_APP_API_BASE_URL + "/clickwraps/transcript";
    console.log(`Making POST request to: ${apiUrl}`);
    
    const response = await axios.post(apiUrl, request, { withCredentials: true });
    console.log("API response received:", response.data); // Log API response

    return handleResponse(response);
  } catch (error) {
    console.error("Error occurred during API call:", error); // Log full error object
    console.error("Error details:", {
      message: error.message,
      config: error.config,
      response: error.response ? error.response.data : "No response from server",
      status: error.response ? error.response.status : "No status code"
    });

    handleError(error);
  }
}
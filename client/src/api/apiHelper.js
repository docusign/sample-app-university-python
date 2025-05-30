export async function handleResponse(response) {
  if (response.status === 200) {
    return response.data;
  }
  if (response.status === 400) {
    const error = await response.text();
    throw new Error(error);
  }
  throw new Error("API response error.");
}

export function handleError(error, setShowJWTModal=undefined) {
  if (error.response && error.response.status === 402) {
    setShowJWTModal(true);
  }
  console.error("API call failed. " + error);
  throw error;
}
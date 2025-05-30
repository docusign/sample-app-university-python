import * as types from "./actionTypes";

export function reducer(state = { envelopeId: "", redirectUrl: "" }, action) {
  switch (action.type) {
    case types.SEND_REQEUST_SUCCESS: {
      const { envelopeId, redirectUrl } = action.payload;
      return { ...state, envelopeId, redirectUrl };
    }
    default:
      return state;
  }
}

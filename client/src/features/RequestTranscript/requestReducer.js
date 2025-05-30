import * as types from "./actionTypes";

export function reducer(state = { request: {} }, action) {
  switch (action.type) {
    case types.SEND_REQEUST_SUCCESS: {
      return action.request;
    }
    case types.GET_CLICKWRAP_SUCCESS: {
      const { clickwrap } = action.payload;
      return { ...state, clickwrap };
    }
    default:
      return state;
  }
}

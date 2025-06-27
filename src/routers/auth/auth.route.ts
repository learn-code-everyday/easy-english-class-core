import {GoogleLogin} from "../auth/apis/google.api";
import {GoogleCallback} from "../auth/apis/google-callback.api";

export default [
  {
    path: "/api/google",
    method: "get",
    action: GoogleLogin,
    options: {
      authentication: false,
      permission: [],
    },
    midd: [],
  },
  {
    path: "/api/google/callback",
    method: "get",
    action: GoogleCallback,
    options: {
      authentication: false,
      permission: [],
    },
    midd: [],
  },
]

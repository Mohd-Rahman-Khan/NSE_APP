import { getUserToken } from "../utils/Storage";
import { API_ROUTES } from "./APIRoutes";
import axios from "axios";
import {
  interceptFetchRequest,
  interceptFetchResponse,
} from "./apiInterceptor";

export const apiRequest = async (
  endPoint,
  method = "GET",
  data,
  tokenOverride = null,
  axiosConfig = {}
) => {
  const token = tokenOverride || (await getUserToken());
  console.log(token, "line 11");
  let options = {
    method,
    url: `${API_ROUTES.BASE_URL}${endPoint}`,
    headers: {
      "Content-Type": "application/json",
    },
    ...axiosConfig,
  };

  if (token) {
    options.headers["Authorization"] = `${token}`;
  }

  if (data && method !== "GET") {
    options.data = data;
  }
  console.log(options, "line 27");
  try {
    const response = await axios(options);
    console.error("API Request", response);
    return response.data;
  } catch (err) {
    console.error("API Request Error:", err.response || err.message);
    throw err;
  }
};

export const formDataApiRequest = async (endPoint, method = "GET", data) => {
  const token = await getUserToken();

  let options = {
    method: method,
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
      // Note: Don't set Content-Type for FormData, let browser handle it
    },
  };

  try {
    // Intercept request (will skip encryption for FormData)
    const intercepted = await interceptFetchRequest(
      `${API_ROUTES.BASE_URL}${endPoint}`,
      options
    );

    const response = await fetch(intercepted.url, intercepted.options);

    // Intercept response
    const processedResponse = await interceptFetchResponse(response, options);

    if (processedResponse.decryptedData !== undefined) {
      return processedResponse.decryptedData;
    }

    try {
      const result = await response.json();
      return result;
    } catch {
      return response;
    }
  } catch (err) {
    console.error("FormData API Request Error:", err);
    throw err;
  }
};

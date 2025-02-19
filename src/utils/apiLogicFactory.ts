// shared logic for api creation that can use auth tokens
// manage your own state
// send your own functions as setters, will be called under your context
// since they are closures

// prevents having to write the logic for this twice and hence
// maintainability :clownface:

import axios from "axios";

// android emulator's bridge to host machine's localhost
const BASE_URL = "http://10.0.2.2:3000/";
// const BASE_URL = "https://whcd6f6715ef77245a55.free.beeceptor.com";
// const BASE_URL = "https://orvio.pavit.xyz";

interface AuthLogicOptions {
  accessToken: string;
  refreshToken: string;
  setAccessToken?: (newToken: string) => void;
  signOut?: () => void;
}

export const createAuthAxios = ({
  accessToken,
  refreshToken,
  setAccessToken,
  signOut,
}: AuthLogicOptions) => {
  const api = axios.create({
    baseURL: BASE_URL,
  });

  // Attach access token to each request
  api.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  // Handle responses
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.log("unauthorized recieved...");
        try {
          const response = await axios.post(`${BASE_URL}auth/refresh`, { refreshToken });
          console.log(response);
          const newAccessToken = response.data.accessToken;

          if (setAccessToken) setAccessToken(newAccessToken);

          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(error.config);
        } catch (refreshError: any) {
          console.error("Token refresh failed");
          console.error("Refresh Error: ", refreshError);
          // prevent from logging out just cus opened when offline lol
          if(refreshError?.response?.status === 403){
            if (signOut) signOut();
          }
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 403) {
        console.error("Session invalid");
        if (signOut) signOut();
      }

      return Promise.reject(error);
    }
  );

  return api;
};

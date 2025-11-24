import axiosClient from "./axiosClient";

export const login = (data) => {
  return axiosClient.post("/auth/access-token", data);
};

export const refreshToken = (refreshToken) => {
  return axiosClient.post("/auth/refresh-token", {
    refreshToken
  });
};

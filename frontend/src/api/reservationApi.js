import axiosClient from "./axiosClient";

export const getAllReservations = () => {
  return axiosClient.get("/reservations");
};

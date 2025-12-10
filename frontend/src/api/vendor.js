import axios from "./axios";
export const getVendorDashboard = async () => {
    return axios.get("dashboard/");

};

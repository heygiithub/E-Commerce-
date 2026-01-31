import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  const PUBLIC_PATHS= [
    "products/",
    "register/vendor/",
    "register/customer/",
    "login/",
    "token/"
  ];

  // If public API → DO NOT send token
  const isPublic = PUBLIC_PATHS.some(path => config.url.startsWith(path));

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// handling refresh token on expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 && !originalRequest._retry
    ){
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken)
        return Promise.reject(error);

      try {
        const res = await axios.post(
          process.env.REACT_APP_API_URL + "/api/token/refresh/",
          {refresh: refreshToken}
        );

          localStorage.setItem("access_token", res.data.access);
          originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;

          return api(originalRequest);

      } catch (refreshError) {
        console.log("Refresh token expired");
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
        
  }
);

export default api;

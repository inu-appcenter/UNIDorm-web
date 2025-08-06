import axios, { AxiosError } from "axios";
import useUserStore from "../stores/useUserStore";
import { refresh } from "../apis/members";

const tokenInstance = axios.create({
  baseURL: "https://inu-dormitory-dev.inuappcenter.kr/",
});

// 요청 인터셉터 - 토큰 설정
tokenInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("엑세스토큰", accessToken);
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 - 403 에러 시 토큰 재발급 및 요청 재시도
tokenInstance.interceptors.response.use(
  (response) => {
    // 모든 응답의 response.data.msg 콘솔 출력
    if (response.data && response.data.msg) {
      console.log(response.data.msg);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 502) {
      alert("네트워크 연결이 불안정하거나, 서버 점검 중입니다.");
      return Promise.reject(error);
    }
    if (
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // 재시도 방지 플래그 설정

      try {
        console.log("리프레시 발급 시도");
        const { data } = await refresh(); // refresh API로 토큰 재발급
        console.log(data);
        const newTokenInfo = data.accessToken; // 새로운 토큰 정보

        // 스토어에 새로운 토큰 정보 저장 (로컬스토리지에도 저장됨)
        const { tokenInfo, setTokenInfo } = useUserStore.getState();

        setTokenInfo({
          ...tokenInfo,
          accessToken: newTokenInfo,
        });

        // useUserStore.getState().setTokenInfo(newTokenInfo);

        // 새로운 토큰을 요청 헤더에 추가하여 원래 요청을 재시도
        tokenInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newTokenInfo}`;
        originalRequest.headers["Authorization"] = `Bearer ${newTokenInfo}`;

        return tokenInstance(originalRequest); // 기존 요청 재시도
      } catch (refreshError) {
        // 리프레시 토큰 재발급 실패 시
        // alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/logout";
        // useUserStore.getState().setTokenInfo({
        //   accessToken: "",
        //   refreshToken: "",
        // });
        // localStorage.removeItem("accessToken");
        // localStorage.removeItem("refreshToken");

        (
          refreshError as AxiosError & { isRefreshError?: boolean }
        ).isRefreshError = true;
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default tokenInstance;

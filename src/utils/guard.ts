// utils/guard.ts
import { PATHS } from "@/constants/paths";
import { getMobilePlatform } from "@/utils/getMobilePlatform";

export const guardLogin = (
  isLoggedIn: boolean,
  navigate: (path: string) => void,
): boolean => {
  if (!isLoggedIn) {
    if (window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?"))
      navigate(PATHS.LOGIN);
    return false;
  }
  return true;
};

// utils/guard.ts
export const guardAppOnly = (): boolean => {
  const platform = getMobilePlatform();

  if (platform === "ios_browser" || platform === "android_browser") {
    const isConfirm = confirm(
      "앱 설치 후 사용할 수 있습니다.\n스토어로 이동할까요?",
    );
    if (!isConfirm) return false;

    const url =
      platform === "ios_browser"
        ? "https://apps.apple.com/kr/app/%EC%9C%A0%EB%8B%88%EB%8F%94/id6751404748"
        : "https://play.google.com/store/apps/details?id=com.hjunieee.inudormitory";

    window.open(url, "_blank");
    return false;
  } else {
    alert(
      "유니돔 앱 환경에서만 이용 가능해요.\n스마트폰에서 앱 설치 후 이용해주세요.",
    );
    return false;
  }
};

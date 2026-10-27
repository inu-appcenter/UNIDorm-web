import { resolvePath, type To } from "react-router-dom";

export interface NavigationTarget {
  pathname: string;
  search: string;
  hash: string;
  fullPath: string;
}

/**
 * 앱 멀티 웹뷰 및 라우팅 경로를 현재 경로 기준으로 정규화합니다.
 * 상대 경로("create", "edit/1", "../other")가 주어지면 현재 브라우저의 pathname을 기준으로 올바른 절대 경로를 도출합니다.
 */
export function resolveNavigationTarget(
  to: To | null | undefined,
  currentPathname: string
): NavigationTarget {
  if (!to) {
    return {
      pathname: currentPathname || "",
      search: "",
      hash: "",
      fullPath: currentPathname || "",
    };
  }

  if (
    typeof to === "string" &&
    (to.startsWith("http://") || to.startsWith("https://") || to.startsWith("//"))
  ) {
    return {
      pathname: to,
      search: "",
      hash: "",
      fullPath: to,
    };
  }

  const resolved = resolvePath(to, currentPathname || "/");
  return {
    pathname: resolved.pathname,
    search: resolved.search,
    hash: resolved.hash,
    fullPath: `${resolved.pathname}${resolved.search}${resolved.hash}`,
  };
}

import { describe, it, expect } from "vitest";
import { resolveNavigationTarget } from "../navigation";

describe("resolveNavigationTarget (앱 멀티 웹뷰 및 라우팅 경로 정규화)", () => {
  const currentPath = "/admin/popup-notifications";

  it("상대 경로 문자열이 주어지면 현재 경로를 기준으로 올바른 절대 경로를 계산한다", () => {
    const target = resolveNavigationTarget("create", currentPath);

    expect(target.pathname).toBe("/admin/popup-notifications/create");
    expect(target.search).toBe("");
    expect(target.hash).toBe("");
    expect(target.fullPath).toBe("/admin/popup-notifications/create");
  });

  it("상대 경로에 파라미터가 포함된 경우에도 정상적으로 결합된다", () => {
    const target = resolveNavigationTarget("edit/42", currentPath);

    expect(target.pathname).toBe("/admin/popup-notifications/edit/42");
    expect(target.fullPath).toBe("/admin/popup-notifications/edit/42");
  });

  it("이미 절대 경로인 경우 현재 경로에 영향받지 않고 해당 절대 경로를 유지한다", () => {
    const target = resolveNavigationTarget("/home", currentPath);

    expect(target.pathname).toBe("/home");
    expect(target.fullPath).toBe("/home");
  });

  it("상위 디렉터리 상대 경로(../)도 정상적으로 상위 경로로 해석된다", () => {
    const target = resolveNavigationTarget("../calendar", currentPath);

    expect(target.pathname).toBe("/admin/calendar");
    expect(target.fullPath).toBe("/admin/calendar");
  });

  it("쿼리스트링이나 해시가 포함된 상대 경로도 온전히 보존된다", () => {
    const target = resolveNavigationTarget("create?step=2#section", currentPath);

    expect(target.pathname).toBe("/admin/popup-notifications/create");
    expect(target.search).toBe("?step=2");
    expect(target.hash).toBe("#section");
    expect(target.fullPath).toBe("/admin/popup-notifications/create?step=2#section");
  });

  it("단순 쿼리스트링(?query=1) 이동인 경우 현재 경로를 유지하고 search가 결합된다", () => {
    const target = resolveNavigationTarget("?page=3", currentPath);

    expect(target.pathname).toBe("/admin/popup-notifications");
    expect(target.search).toBe("?page=3");
    expect(target.fullPath).toBe("/admin/popup-notifications?page=3");
  });

  it("단순 해시(#preview) 이동인 경우 현재 경로를 유지하고 hash가 결합된다", () => {
    const target = resolveNavigationTarget("#preview", currentPath);

    expect(target.pathname).toBe("/admin/popup-notifications");
    expect(target.hash).toBe("#preview");
    expect(target.fullPath).toBe("/admin/popup-notifications#preview");
  });

  it("외부 URL(http://, https://, //)은 변조 없이 그대로 유지된다", () => {
    const httpsTarget = resolveNavigationTarget("https://inu.ac.kr/dorm", currentPath);
    expect(httpsTarget.fullPath).toBe("https://inu.ac.kr/dorm");
    expect(httpsTarget.pathname).toBe("https://inu.ac.kr/dorm");

    const protocolRelativeTarget = resolveNavigationTarget("//cdn.inu.ac.kr/asset.png", currentPath);
    expect(protocolRelativeTarget.fullPath).toBe("//cdn.inu.ac.kr/asset.png");
  });

  it("객체 형태의 to({ pathname, search })도 정상적으로 결합된다", () => {
    const objTarget = resolveNavigationTarget(
      { pathname: "create", search: "?mode=draft" },
      currentPath
    );

    expect(objTarget.pathname).toBe("/admin/popup-notifications/create");
    expect(objTarget.search).toBe("?mode=draft");
    expect(objTarget.fullPath).toBe("/admin/popup-notifications/create?mode=draft");
  });

  it("to가 빈 문자열이거나 undefined인 경우 현재 경로를 안전하게 반환한다", () => {
    expect(resolveNavigationTarget("", currentPath).fullPath).toBe(currentPath);
    expect(resolveNavigationTarget(undefined, currentPath).fullPath).toBe(currentPath);
    expect(resolveNavigationTarget(null, currentPath).fullPath).toBe(currentPath);
  });
});

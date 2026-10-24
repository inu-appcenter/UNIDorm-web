import { describe, it, expect } from "vitest";
import { jwtExpiryNaive, withTokenExpiry } from "../jwtExpiry";

const jwtWithExp = (exp: number) =>
  `h.${btoa(JSON.stringify({ exp })).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")}.s`;

describe("jwtExpiry", () => {
  it("exp 클레임을 로컬 시각 문자열로 바꾼다", () => {
    const exp = Math.floor(new Date(2030, 5, 1, 9, 30, 5).getTime() / 1000);
    expect(jwtExpiryNaive(jwtWithExp(exp))).toBe("2030-06-01T09:30:05");
  });

  it("JWT가 아니면 빈 문자열을 돌려준다", () => {
    expect(jwtExpiryNaive("not-a-jwt")).toBe("");
    expect(jwtExpiryNaive("")).toBe("");
  });

  it("syncTokenInfo가 요구하는 만료 시각 필드를 채운다", () => {
    const result = withTokenExpiry({ accessToken: "", refreshToken: "", role: "" });
    expect(result).toMatchObject({ accessTokenExpiredTime: "", refreshTokenExpiredTime: "" });
  });
});

import { describe, expect, it } from "vitest";
import { OpenChatRoom } from "../../types/openchat";
import { isOpenChatRoomClosed } from "../openChat";

const createRoom = (overrides: Partial<OpenChatRoom> = {}): OpenChatRoom => ({
  roomId: 1,
  name: "테스트 채팅방",
  description: "",
  scope: "ALL",
  roomType: "OPEN",
  chatCategory: "OPEN_CHAT",
  hasPassword: false,
  currentParticipants: 1,
  maxParticipants: 10,
  lastMessageAt: "",
  lastMessage: "",
  unreadCount: 0,
  joined: false,
  ...overrides,
});

describe("isOpenChatRoomClosed", () => {
  it("recruitmentClosed가 true이면 마감으로 판단한다", () => {
    expect(isOpenChatRoomClosed(createRoom({ recruitmentClosed: true }))).toBe(
      true,
    );
  });

  it("서버의 joinable이 false이면 마감으로 판단한다", () => {
    expect(isOpenChatRoomClosed(createRoom({ joinable: false }))).toBe(true);
  });

  it("모집 중인 방은 마감으로 판단하지 않는다", () => {
    expect(
      isOpenChatRoomClosed(
        createRoom({
          recruitmentClosed: false,
          recruitmentStatus: "OPEN",
          joinable: true,
        }),
      ),
    ).toBe(false);
  });
});

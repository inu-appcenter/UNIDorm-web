import { Outlet } from "react-router-dom";

export default function RoomMateListWrapper() {
  return (
    <div style={{ position: "relative" }}>
      <Outlet />
    </div>
  );
}

import styled from "styled-components";
import { getTypeBackgroundColor } from "@/utils/announceUtils";
import { ANNOUNCE_CATEGORY_LIST } from "@/constants/announcement";

export const TypeBadge = styled.div<{
  type: (typeof ANNOUNCE_CATEGORY_LIST)[number]["value"];
}>`
  border-radius: 16px;
  background: ${(props) => getTypeBackgroundColor(props.type)};
  padding: 4px 8px;
  box-sizing: border-box;
  min-width: fit-content;
  color: var(--1, #1c1c1e);
  font-size: 12px;
`;

export const UrgentBadge = styled.div`
  font-size: 12px;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 3px 7px;
  box-sizing: border-box;
  border-radius: 16px;
  min-width: fit-content;
`;

export const NoticeTagWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
  min-width: fit-content;
`;

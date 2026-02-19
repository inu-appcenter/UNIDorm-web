import React from "react";
import styled from "styled-components";
import { Drawer } from "vaul";
import { PopupNotification } from "@/types/popup-notifications";
import { formatTimeAgo } from "@/utils/dateUtils";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: PopupNotification[];
  onSelect: (noti: PopupNotification) => void;
}

export default function HomeNoticeListBottomSheet({
  isOpen,
  onOpenChange,
  notifications,
  onSelect,
}: Props) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Overlay />
        <Content>
          <HandleArea>
            <HandleBar />
          </HandleArea>

          <FixedHeader>
            <Drawer.Title asChild>
              <h2>홈 화면 공지 목록</h2>
            </Drawer.Title>
            <Drawer.Description />
          </FixedHeader>

          <ScrollContent>
            {notifications.length > 0 ? (
              <ListWrapper>
                {notifications.map((noti) => (
                  <NotiItem key={noti.id} onClick={() => onSelect(noti)}>
                    <div className="top">
                      <span className="type">{noti.notificationType}</span>
                      <span className="date">{formatTimeAgo(noti.createdDate)}</span>
                    </div>
                    <div className="title">{noti.title}</div>
                    <div className="preview">{noti.content}</div>
                  </NotiItem>
                ))}
              </ListWrapper>
            ) : (
              <EmptyState>진행 중인 공지가 없습니다.</EmptyState>
            )}
          </ScrollContent>
        </Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const Overlay = styled(Drawer.Overlay).withConfig({
  shouldForwardProp: (prop) => !["overlay"].includes(prop),
})`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9990;
`;

const Content = styled(Drawer.Content).withConfig({
  shouldForwardProp: (prop) => !["overlay"].includes(prop),
})`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9991;
  background-color: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  outline: none;

  @media (min-width: 769px) {
    max-width: 50vw;
    margin: 0 auto;
  }
`;

const HandleArea = styled.div`
  width: 100%;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
`;

const HandleBar = styled.div`
  width: 48px;
  height: 4px;
  border-radius: 99px;
  background-color: #d1d5db;
`;

const FixedHeader = styled.div`
  flex-shrink: 0;
  padding: 0 20px 16px 20px;
  border-bottom: 1px solid #f3f4f6;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1c1c1e;
  }
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 40px 20px;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotiItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  .top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    
    .type {
      font-size: 12px;
      color: #007aff;
      font-weight: 600;
    }
    .date {
      font-size: 11px;
      color: #999;
    }
  }

  .title {
    font-size: 15px;
    font-weight: 600;
    color: #1c1c1e;
    margin-bottom: 4px;
  }

  .preview {
    font-size: 13px;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const EmptyState = styled.div`
  padding: 60px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

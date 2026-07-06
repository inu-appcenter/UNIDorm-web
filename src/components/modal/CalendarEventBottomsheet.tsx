import styled from "styled-components";
import { Drawer } from "vaul";
import { format, parseISO } from "date-fns";
import { CalendarItem } from "@/types/calendar";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedDate: Date | null;
  events: CalendarItem[];
  getCalendarColor: (id: number) => string;
  onClickEvent: (event: CalendarItem) => void;
}

export default function CalendarEventBottomSheet({
  isOpen,
  setIsOpen,
  selectedDate,
  events,
  getCalendarColor,
  onClickEvent,
}: Props) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Overlay />

        <Content>
          <HandleArea>
            <HandleBar />
          </HandleArea>

          {selectedDate && (
            <SheetTitle>{format(selectedDate, "yyyy.MM.dd")}</SheetTitle>
          )}

          <EventList>
            {events.length === 0 ? (
              <EmptyText>해당 날짜에 일정이 없습니다.</EmptyText>
            ) : (
              events.map((event) => (
                <EventItem
                  key={event.id}
                  type="button"
                  onClick={() => onClickEvent(event)}
                >
                  <ColorBar $color={getCalendarColor(event.id)} />

                  <TopRow>
                    <Title>{event.title}</Title>
                    <DateText>
                      {format(parseISO(event.startDate), "MM.dd")} -{" "}
                      {format(parseISO(event.endDate), "MM.dd")}
                    </DateText>
                  </TopRow>

                  {event.description && (
                    <Description>{event.description}</Description>
                  )}
                </EventItem>
              ))
            )}
          </EventList>

          <Footer>
            <button type="button" onClick={() => setIsOpen(false)}>
              닫기
            </button>
          </Footer>
        </Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const Overlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.35);
  z-index: 50;
`;

const Content = styled(Drawer.Content)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: #ffffff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  outline: none;

  @media (min-width: 769px) {
    max-width: 480px;
    margin: 0 auto;
  }
`;

const HandleArea = styled.div`
  padding: 8px 0 14px;
  display: flex;
  justify-content: center;
`;

const HandleBar = styled.div`
  width: 48px;
  height: 4px;
  border-radius: 999px;
  background-color: #d1d5db;
`;

const SheetTitle = styled.div`
  padding: 0 16px 12px;
  font-size: 17px;
  font-weight: 800;
  color: #222;
`;

const EventList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
`;

const EventItem = styled.button`
  width: 100%;
  border: none;
  background: #ffffff;
  text-align: left;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const ColorBar = styled.div<{ $color: string }>`
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background-color: ${({ $color }) => $color};
`;

const TopRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const Title = styled.div`
  flex: 1;
  font-size: 19px;
  font-weight: 800;
  color: #222;
  line-height: 1.35;
  word-break: keep-all;
`;

const DateText = styled.div`
  flex-shrink: 0;
  font-size: 15px;
  color: #9ca3af;
  line-height: 1.5;
`;

const Description = styled.div`
  font-size: 15px;
  color: #666;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: keep-all;
`;

const EmptyText = styled.p`
  padding: 32px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-top: 1px solid #f3f4f6;
  padding: 12px 20px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));

  button {
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 400;
    color: #777777;
    line-height: 1.5;
    cursor: pointer;
    padding: 0;
  }
`;

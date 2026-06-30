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
  background-color: white;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
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
  padding: 0 26px 16px;
  font-size: 17px;
  font-weight: 800;
  color: #222;
`;

const EventList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 26px 20px;
`;

const EventItem = styled.button`
  width: 100%;
  border: none;
  background: white;
  text-align: left;
  padding: 14px 0 24px;
  cursor: pointer;
`;

const ColorBar = styled.div<{ $color: string }>`
  width: 100px;
  height: 5px;
  border-radius: 999px;
  background-color: ${({ $color }) => $color};
  margin-bottom: 14px;
`;

const TopRow = styled.div`
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
  margin-top: 8px;
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
  border-top: 1px solid #f3f4f6;
  padding: 14px 26px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  text-align: right;

  button {
    background: none;
    border: none;
    font-size: 15px;
    font-weight: 600;
    color: #777;
    cursor: pointer;
  }
`;

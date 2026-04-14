import type { EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { ReactNode } from "react";

interface HolidayCalendarViewProps {
  events: EventInput[];
  onEventClick: (info: EventClickArg) => void;
  onEventContent: (arg: EventContentArg) => ReactNode;
}

export default function HolidayCalendarView({ events, onEventClick, onEventContent }: HolidayCalendarViewProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,dayGridYear",
      }}
      height="auto"
      eventClick={onEventClick}
      eventContent={onEventContent}
    />
  );
}
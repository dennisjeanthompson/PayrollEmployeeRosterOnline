import { Q as jsxRuntimeExports } from './vendor-CSPGr19o.js';
import { F as FullCalendar, i as index, b as index$1 } from './vendor-calendar-BtSH9WeT.js';

function HolidayCalendarView({ events, onEventClick, onEventContent }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    FullCalendar,
    {
      plugins: [index, index$1],
      initialView: "dayGridMonth",
      events,
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,dayGridYear"
      },
      height: "auto",
      eventClick: onEventClick,
      eventContent: onEventContent
    }
  );
}

export { HolidayCalendarView as default };

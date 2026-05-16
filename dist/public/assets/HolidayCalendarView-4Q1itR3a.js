import { Q as jsxRuntimeExports } from './vendor-BZHHI3oX.js';
import { F as FullCalendar, i as index, b as index$1 } from './vendor-calendar-CxNXhoCY.js';

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

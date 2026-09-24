import AddBooking from "../../../../components/dashboard/booking/AddBooking";
import DashboardShell from "../../../../components/dashboard/DashboardShell";

const days = [
  "Mon 21",
  "Tue 22",
  "Wed 23",
  "Thu 24",
  "Fri 25",
  "Sat 26",
  "Sun 27",
];
const events = [
  ["Olivia Bennett", "Premier Suite", "10:00", "confirmed"],
  ["Ethan Carter", "Deluxe King", "12:30", "checked"],
  ["Mia Anderson", "Garden Residence", "15:00", "pending"],
];

export default function CalendarPage() {
  return (
    <DashboardShell
      eyebrow="Front desk schedule"
      title="Calendar and availability"
      action={<AddBooking />}
    >
      <section className="dashboard-page-content">
        <div className="dashboard-calendar-toolbar">
          <div>
            <p className="section-tag mb-1">September 2026</p>
            <h3>Weekly overview</h3>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-light">
              <i className="bi bi-chevron-left"></i>
            </button>
            <button type="button" className="btn btn-outline-dark">
              Today
            </button>
            <button type="button" className="btn btn-light">
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
        <div className="dashboard-panel">
          <div className="dashboard-calendar-grid">
            {days.map((day, index) => (
              <div className="calendar-day" key={day}>
                <div className="calendar-day-head">
                  <span>{day.split(" ")[0]}</span>
                  <strong className={index === 3 ? "today" : ""}>
                    {day.split(" ")[1]}
                  </strong>
                </div>
                {index === 3 ? (
                  events.map(([guest, room, time, type]) => (
                    <div className={`calendar-event ${type}`} key={guest}>
                      <strong>{time}</strong>
                      <span>{guest}</span>
                      <small>{room}</small>
                    </div>
                  ))
                ) : (
                  <div className="calendar-empty">
                    <i className="bi bi-plus"></i>
                    <span>Available</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

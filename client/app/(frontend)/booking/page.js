import Link from "next/link";

const stayHighlights = [
  "Breakfast Included",
  "Free Airport Transfer",
  "Flexible Cancellation",
  "Private Concierge",
];

const summaryRooms = [
  {
    name: "Deluxe King Room",
    price: "$189 / night",
    meta: "2 Guests · City View",
  },
  {
    name: "Premier Suite",
    price: "$269 / night",
    meta: "3 Guests · Balcony",
  },
];

export default function BookingPage() {
  return (
    <main>
      <section className="page-banner small-banner">
        <div className="container h-100 d-flex align-items-center">
          <div>
            <p className="section-tag mb-2">BOOK YOUR STAY</p>
            <h1 className="page-title mb-0">Reserve a Luxury Experience</h1>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row g-4 align-items-start">
            <div className="col-lg-8">
              <div className="booking-box p-4 p-lg-5">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                  <div>
                    <p className="section-tag text-primary mb-1">Reservation</p>
                    <h2 className="section-title mb-0">Booking Details</h2>
                  </div>
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                    Instant Confirmation
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Check In</label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      defaultValue="2026-10-11"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Check Out</label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      defaultValue="2026-10-16"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Guests</label>
                    <select className="form-select form-select-lg">
                      <option>2 Adults</option>
                      <option>3 Adults</option>
                      <option>4 Adults</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Rooms</label>
                    <select className="form-select form-select-lg">
                      <option>1 Room</option>
                      <option>2 Rooms</option>
                      <option>3 Rooms</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Room Type</label>
                    <select className="form-select form-select-lg">
                      <option>Deluxe Suite</option>
                      <option>Family Suite</option>
                      <option>Royal Villa</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">First Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Your first name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Last Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Your last name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      placeholder="+11 345 67890"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Special Requests
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Optional notes for your stay, such as room preferences or celebration requests."
                    />
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4">
                  <button className="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-semibold">
                    Confirm Reservation
                  </button>
                  <Link
                    href="/rooms"
                    className="btn btn-outline-dark btn-lg rounded-pill px-4 py-3 fw-semibold"
                  >
                    Browse Rooms
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div
                className="bg-white rounded-4 border shadow-sm p-4 sticky-top"
                style={{ top: 100 }}
              >
                <p className="section-tag text-primary mb-2">Booking Summary</p>
                <h3 className="mb-3">Your Stay</h3>

                {summaryRooms.map((room) => (
                  <div
                    key={room.name}
                    className="border rounded-4 p-3 mb-3 bg-light-subtle"
                  >
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <h5 className="mb-1">{room.name}</h5>
                        <small className="text-secondary">{room.meta}</small>
                      </div>
                      <strong className="text-primary">{room.price}</strong>
                    </div>
                  </div>
                ))}

                <div className="border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Room total</span>
                    <strong>$458</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Taxes & fees</span>
                    <strong>$72</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Service fee</span>
                    <strong>$30</strong>
                  </div>
                  <div className="d-flex justify-content-between fs-5 fw-bold pt-2 border-top mt-2">
                    <span>Total</span>
                    <span className="text-primary">$560</span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 fw-semibold">Included benefits</p>
                  <div className="d-flex flex-wrap gap-2">
                    {stayHighlights.map((item) => (
                      <span
                        key={item}
                        className="badge rounded-pill bg-light text-dark border"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

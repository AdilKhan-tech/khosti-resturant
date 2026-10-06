"use client";

import Link from "next/link";

const reservationDetails = [
  { label: "Check-in", value: "11 Oct 2026" },
  { label: "Check-out", value: "16 Oct 2026" },
  { label: "Guests", value: "2 Adults" },
  { label: "Room", value: "Deluxe King Room" },
];

export default function ThankYouPage() {
  return (
    <main>
      <section className="page-banner small-banner">
        <div className="container h-100 d-flex align-items-center">
          <div>
            <p className="section-tag mb-2">RESERVATION</p>
            <h1 className="page-title mb-0">Thank you for booking</h1>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-xl-8">
              <div className="booking-box p-4 p-lg-5">
                <div className="text-center mb-4">
                  <div
                    className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: 88,
                      height: 88,
                      background: "rgba(184, 111, 66, 0.12)",
                      color: "#b86f42",
                    }}
                  >
                    <i className="bi bi-check2-circle fs-1"></i>
                  </div>
                  <p className="section-tag text-primary mb-2">CONFIRMED</p>
                  <h2 className="section-title mb-3">Your stay is booked!</h2>
                  <p
                    className="text-secondary mx-auto mb-0"
                    style={{ maxWidth: 620 }}
                  >
                    Thanks for choosing Khosti Restaurant & Hotel. A
                    confirmation email has been sent with your reservation
                    summary and check-in instructions.
                  </p>
                </div>

                <div className="row g-3 mb-4">
                  {reservationDetails.map((item) => (
                    <div key={item.label} className="col-sm-6 col-lg-3">
                      <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                        <small className="text-secondary d-block mb-1">
                          {item.label}
                        </small>
                        <strong className="d-block fs-6 text-dark">
                          {item.value}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border rounded-4 p-4 bg-light-subtle">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                    <div>
                      <p className="section-tag text-primary mb-1">
                        BOOKING REFERENCE
                      </p>
                      <h4 className="mb-0">KHOSTI-2048</h4>
                    </div>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fs-6">
                      Paid in full
                    </span>
                  </div>

                  <div className="row g-3 text-secondary">
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between gap-3 border-bottom pb-2">
                        <span>Room total</span>
                        <strong className="text-dark">$458</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between gap-3 border-bottom pb-2">
                        <span>Taxes & fees</span>
                        <strong className="text-dark">$52</strong>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between gap-3 pt-2">
                        <span className="fw-semibold text-dark">
                          Total paid
                        </span>
                        <strong className="fs-5 text-primary">$510</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
                  <Link
                    href="/"
                    className="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-semibold"
                  >
                    Back to home
                  </Link>
                  <Link
                    href="/rooms"
                    className="btn btn-outline-dark btn-lg rounded-pill px-4 py-3 fw-semibold"
                  >
                    Explore more stays
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const contactItems = [
  {
    icon: "bi bi-geo-alt-fill",
    title: "Address",
    value: "15 Prince Road, London, United Kingdom",
  },
  {
    icon: "bi bi-telephone-fill",
    title: "Phone",
    value: "+11 345 67890",
  },
  {
    icon: "bi bi-envelope-fill",
    title: "Email",
    value: "info@khostirestaurant.com",
  },
];

export default function ContactPage() {
  return (
    <main>
      <section className="page-banner small-banner">
        <div className="container h-100 d-flex align-items-center">
          <div>
            <p className="section-tag mb-2">CONTACT</p>
            <h1 className="page-title mb-0">Let’s Plan Your Stay</h1>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row g-4">
            {contactItems.map((item) => (
              <div key={item.title} className="col-md-4">
                <div className="contact-card h-100">
                  <div className="contact-icon">
                    <i className={item.icon}></i>
                  </div>
                  <h4>{item.title}</h4>
                  <p className="mb-0 text-secondary">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-7">
              <div className="booking-box p-4 p-lg-5">
                <p className="section-tag text-primary mb-2">SEND MESSAGE</p>
                <h2 className="section-title mb-4">Contact Our Team</h2>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Your Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Full name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Email"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      placeholder="Phone"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Subject</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Reservation / Inquiry"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Message</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                </div>

                <button className="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-semibold mt-4">
                  Send Message
                </button>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="contact-map rounded-4 overflow-hidden shadow-sm">
                <div className="map-overlay d-flex align-items-center justify-content-center text-center p-4">
                  <div>
                    <div className="map-pin mb-3">
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <h4 className="text-white mb-0">Khosti Restaurant</h4>
                    <p className="text-white-50 mb-0">Central London</p>
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

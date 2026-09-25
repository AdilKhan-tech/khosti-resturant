import Link from "next/link";

const featuredRooms = [
  {
    name: "Chef's Tasting",
    price: "$159/Menu",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Garden Table",
    price: "$199/Menu",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Private Dining",
    price: "$299/Menu",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  },
];

const facilityList = [
  "Seasonal tasting menu",
  "Private dining rooms",
  "Craft cocktail bar",
  "Live chef counter",
  "Valet parking",
  "Table service",
];

export default function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-lg-6 text-white">
              <p className="section-tag">KHOSTI RESTAURANT</p>
              <h1 className="hero-title">
                A considered dining experience in the heart of the city
              </h1>
              <p className="hero-text">
                Seasonal ingredients, thoughtful hospitality, and a room made
                for long evenings, celebrations, and good conversation.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link
                  href="/rooms"
                  className="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-semibold"
                >
                  Explore the menu
                </Link>
                <Link
                  href="/room-details"
                  className="btn btn-outline-light btn-lg rounded-pill px-4 py-3 fw-semibold"
                >
                  Reserve a table
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="booking-box">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 text-dark">Reserve your table</h4>
                  <span className="badge text-bg-primary">Open tonight</span>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">
                      Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      defaultValue="2026-10-11"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">
                      Time
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      defaultValue="19:30"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">
                      Party size
                    </label>
                    <select className="form-select">
                      <option>2 Adults</option>
                      <option>3 Adults</option>
                      <option>4 Adults</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">
                      Experience
                    </label>
                    <select className="form-select">
                      <option>Tasting menu</option>
                      <option>Chef's counter</option>
                      <option>Private dining</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <small className="text-secondary d-block">
                      Starting from
                    </small>
                    <strong className="fs-3 text-dark">$159</strong>
                  </div>
                  <Link
                    href="/booking"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Find a table
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="feature-box">
                <i className="bi bi-stars fs-3 text-primary"></i>
                <h5 className="mt-3 mb-2">Seasonal plates</h5>
                <p className="mb-0 text-secondary">
                  A menu that follows the best ingredients of the season.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-box">
                <i className="bi bi-cup-hot fs-3 text-primary"></i>
                <h5 className="mt-3 mb-2">Warm hospitality</h5>
                <p className="mb-0 text-secondary">
                  Service that feels polished, personal, and unhurried.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-box">
                <i className="bi bi-fire fs-3 text-primary"></i>
                <h5 className="mt-3 mb-2">Open kitchen</h5>
                <p className="mb-0 text-secondary">
                  Watch each plate come together at the chef's counter.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-box">
                <i className="bi bi-music-note-beamed fs-3 text-primary"></i>
                <h5 className="mt-3 mb-2">Evening atmosphere</h5>
                <p className="mb-0 text-secondary">
                  Low light, good music, and room to stay awhile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
            <div>
              <p className="section-tag text-primary mb-2">THE MENU</p>
              <h2 className="section-title mb-0">
                A menu worth lingering over
              </h2>
            </div>
            <Link
              href="/rooms"
              className="btn btn-outline-dark rounded-pill px-4"
            >
              View full menu
            </Link>
          </div>

          <div className="row g-4">
            {featuredRooms.map((room) => (
              <div key={room.name} className="col-lg-4 col-md-6">
                <div className="room-card">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="room-image"
                  />
                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4 className="mb-0">{room.name}</h4>
                      <span className="fw-bold text-primary">{room.price}</span>
                    </div>
                    <div className="mb-3 text-warning">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-half"></i>
                    </div>
                    <p className="text-secondary mb-3">
                      Elegant interiors, cozy bedding, and private comfort
                      designed for memorable stays.
                    </p>
                    <Link
                      href="/room-details"
                      className="btn btn-primary rounded-pill px-4"
                    >
                      Reserve a table
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
                alt="Khosti Restaurant dining room"
                className="img-fluid rounded-4 shadow"
                style={{ height: 500, objectFit: "cover", width: "100%" }}
              />
            </div>
            <div className="col-lg-6">
              <p className="section-tag text-primary mb-2">
                THE KH​​OSTI TABLE
              </p>
              <h2 className="section-title mb-3">
                A room designed around the pleasure of gathering.
              </h2>
              <p className="text-secondary mb-4">
                Khosti Restaurant brings together seasonal cooking, a quietly
                confident room, and the kind of welcome that makes dinner feel
                like an occasion.
              </p>
              <div className="row g-3">
                {facilityList.map((item) => (
                  <div key={item} className="col-sm-6">
                    <div className="facility-pill">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

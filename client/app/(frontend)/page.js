import Link from "next/link";

const featuredRooms = [
  {
    name: "Deluxe Room",
    price: "$159/Night",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Double Room",
    price: "$199/Night",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Premium Suite",
    price: "$299/Night",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  },
];

const facilityList = [
  "Free Wi-Fi",
  "Pool & Spa",
  "Restaurant",
  "Bar & Lounge",
  "Airport Shuttle",
  "Room Service",
];

export default function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-lg-6 text-white">
              <p className="section-tag">SONA HOTEL</p>
              <h1 className="hero-title">A Luxury Stay in the Heart of the City</h1>
              <p className="hero-text">
                Discover elegant rooms, exceptional dining, and memorable experiences designed for modern travelers.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link href="/rooms" className="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-semibold">
                  Discover Now
                </Link>
                <Link href="/room-details" className="btn btn-outline-light btn-lg rounded-pill px-4 py-3 fw-semibold">
                  View Room Details
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="booking-box">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 text-dark">Booking Your Hotel</h4>
                  <span className="badge text-bg-primary">Open</span>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">Check In</label>
                    <input type="date" className="form-control" defaultValue="2026-10-11" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">Check Out</label>
                    <input type="date" className="form-control" defaultValue="2026-10-16" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">Guests</label>
                    <select className="form-select">
                      <option>2 Adults</option>
                      <option>3 Adults</option>
                      <option>4 Adults</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">Room Type</label>
                    <select className="form-select">
                      <option>Deluxe</option>
                      <option>Suite</option>
                      <option>Premium</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <small className="text-secondary d-block">Starting from</small>
                    <strong className="fs-3 text-dark">$159</strong>
                  </div>
                  <Link href="/booking" className="btn btn-primary rounded-pill px-4">
                    Search
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
                <i className="bi bi-building fs-3 text-primary"></i>
                <h5 className="mt-3 mb-2">Luxury Rooms</h5>
                <p className="mb-0 text-secondary">Elegantly designed spaces for restful stays.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-box">
                <i className="bi bi-cup-hot fs-3 text-primary"></i>
                <h5 className="mt-3 mb-2">Fine Dining</h5>
                <p className="mb-0 text-secondary">Curated cuisine with premium ingredients.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-box">
                <i className="bi bi-water fs-3 text-primary"></i>
                <h5 className="mt-3 mb-2">Pool & Spa</h5>
                <p className="mb-0 text-secondary">Rejuvenation and wellness in complete comfort.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-box">
                <i className="bi bi-geo-alt fs-3 text-primary"></i>
                <h5 className="mt-3 mb-2">Prime Location</h5>
                <p className="mb-0 text-secondary">Minutes away from key city attractions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
            <div>
              <p className="section-tag text-primary mb-2">OUR ROOMS</p>
              <h2 className="section-title mb-0">Explore Our Rooms</h2>
            </div>
            <Link href="/rooms" className="btn btn-outline-dark rounded-pill px-4">
              View All Rooms
            </Link>
          </div>

          <div className="row g-4">
            {featuredRooms.map((room) => (
              <div key={room.name} className="col-lg-4 col-md-6">
                <div className="room-card">
                  <img src={room.image} alt={room.name} className="room-image" />
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
                      Elegant interiors, cozy bedding, and private comfort designed for memorable stays.
                    </p>
                    <Link href="/room-details" className="btn btn-primary rounded-pill px-4">
                      Book Now
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
                alt="Hotel facilities"
                className="img-fluid rounded-4 shadow"
                style={{ height: 500, objectFit: "cover", width: "100%" }}
              />
            </div>
            <div className="col-lg-6">
              <p className="section-tag text-primary mb-2">WHY CHOOSE US</p>
              <h2 className="section-title mb-3">Comfortable, genuine, and memorable.</h2>
              <p className="text-secondary mb-4">
                At SONA, we blend contemporary design with warm hospitality to create a stay that feels both luxurious and personal.
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

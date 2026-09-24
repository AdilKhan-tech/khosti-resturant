import Link from "next/link";

const gallery = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=80",
];

const amenities = ["Air Conditioning", "Complimentary Breakfast", "Free Wi-Fi", "Private Balcony", "Bathroom Amenities", "24/7 Room Service"];

export default function RoomDetailsPage() {
  return (
    <main>
      <section className="page-banner small-banner">
        <div className="container h-100 d-flex align-items-center">
          <div>
            <p className="section-tag mb-2">ROOM DETAILS</p>
            <h1 className="page-title mb-0">Premium Deluxe Room</h1>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-lg-8">
              <img
                src={gallery[0]}
                alt="Premium Deluxe Room"
                className="img-fluid rounded-4 mb-4"
                style={{ width: "100%", height: 520, objectFit: "cover" }}
              />

              <div className="row g-3">
                {gallery.map((image) => (
                  <div key={image} className="col-md-4">
                    <img src={image} alt="Room view" className="img-fluid rounded-4" style={{ height: 180, width: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="booking-box sticky-top" style={{ top: 100 }}>
                <h3 className="mb-3">$179 <small className="text-secondary">/Night</small></h3>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label text-secondary small">Check In</label>
                    <input type="date" className="form-control" defaultValue="2026-10-11" />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small">Check Out</label>
                    <input type="date" className="form-control" defaultValue="2026-10-16" />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-secondary small">Guests</label>
                    <select className="form-select">
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4 Guests</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 d-grid gap-2">
                  <button className="btn btn-primary rounded-pill py-3">Book Now</button>
                  <Link href="/rooms" className="btn btn-outline-dark rounded-pill py-3">Back to Rooms</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row g-5">
            <div className="col-lg-8">
              <h3 className="mb-3">Room Overview</h3>
              <p className="text-secondary">
                Our Premium Deluxe Room combines elegant design with practical comfort, offering a spacious atmosphere and premium details for work or leisure stays. With a serene color palette, soft textures, and high-end finishes, every night feels relaxing and restorative.
              </p>
              <p className="text-secondary">
                Enjoy city or sea views from a private balcony, unwind with plush bedding, and make the most of thoughtful in-room conveniences.
              </p>

              <h4 className="mt-5 mb-3">Amenities</h4>
              <div className="row g-3">
                {amenities.map((item) => (
                  <div key={item} className="col-md-6">
                    <div className="facility-pill justify-content-start px-3">{item}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="bg-light rounded-4 p-4 border">
                <h4 className="mb-3">Room Details</h4>
                <ul className="list-unstyled mb-0 text-secondary">
                  <li className="mb-2"><strong className="text-dark">Size:</strong> 380 sq ft</li>
                  <li className="mb-2"><strong className="text-dark">Bed:</strong> King Bed</li>
                  <li className="mb-2"><strong className="text-dark">Max Occupancy:</strong> 3 Guests</li>
                  <li><strong className="text-dark">View:</strong> City / Sea</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

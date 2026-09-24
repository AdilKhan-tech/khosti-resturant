import Link from "next/link";

const rooms = [
  { name: "Premium Deluxe", price: "$179/Night", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", tag: "Sea View" },
  { name: "Family Suite", price: "$239/Night", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80", tag: "Garden" },
  { name: "Executive Room", price: "$209/Night", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80", tag: "City View" },
  { name: "Junior Suite", price: "$269/Night", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80", tag: "Best Seller" },
  { name: "Royal Villa", price: "$399/Night", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", tag: "Private Pool" },
  { name: "Sky Loft", price: "$329/Night", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80", tag: "Top Floor" },
];

export default function RoomsPage() {
  return (
    <main>
      <section className="page-banner">
        <div className="container h-100 d-flex align-items-center">
          <div>
            <p className="section-tag mb-2">OUR ROOMS</p>
            <h1 className="page-title mb-0">Rooms & Suites</h1>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="row g-4">
            {rooms.map((room) => (
              <div key={room.name} className="col-lg-4 col-md-6">
                <div className="room-card h-100">
                  <img src={room.image} alt={room.name} className="room-image" />
                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-primary-subtle text-primary rounded-pill">{room.tag}</span>
                      <span className="fw-bold text-primary">{room.price}</span>
                    </div>
                    <h4 className="mb-3">{room.name}</h4>
                    <p className="text-secondary mb-4">Luxury accommodation with premium amenities and elegant furnishing throughout.</p>
                    <div className="d-flex gap-2">
                      <Link href="/room-details" className="btn btn-primary rounded-pill flex-fill">View Details</Link>
                      <Link href="/booking" className="btn btn-outline-dark rounded-pill">Book</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

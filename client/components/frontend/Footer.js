import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/room-details", label: "Room Details" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="footer-area mt-5">
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="brand-mark footer-mark">K</span>
              <div>
                <div className="brand-name text-white">KHOSTI RESTAURANT</div>
                <small className="brand-sub text-white-50">FINE DINING</small>
              </div>
            </div>
            <p className="text-white-50 mb-0">
              We inspire and reach millions of travelers across 90 local markets
              in over 30 countries.
            </p>
          </div>

          <div className="col-lg-2 col-md-4">
            <h5 className="text-white mb-3">Services</h5>
            <ul className="list-unstyled text-white-50 mb-0">
              <li className="mb-2">Wi-Fi</li>
              <li className="mb-2">Restaurant</li>
              <li className="mb-2">Spa</li>
              <li>Gym</li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-4">
            <h5 className="text-white mb-3">Contact</h5>
            <ul className="list-unstyled text-white-50 mb-0">
              <li className="mb-2">15 Prince Road, London</li>
              <li className="mb-2">+11 345 67890</li>
              <li>info@khostirestaurant.com</li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-4">
            <h5 className="text-white mb-3">Quick Links</h5>
            <ul className="list-unstyled mb-0">
              {footerLinks.map((item) => (
                <li key={item.href} className="mb-2">
                  <Link
                    href={item.href}
                    className="text-white-50 text-decoration-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

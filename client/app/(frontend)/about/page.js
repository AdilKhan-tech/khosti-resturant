const stats = [
  { value: "12+", label: "Years of Excellence" },
  { value: "4.9/5", label: "Guest Satisfaction" },
  { value: "120", label: "Premium Suites" },
  { value: "30k+", label: "Happy Guests" },
];

const values = [
  {
    icon: "bi bi-heart-fill",
    title: "Thoughtful Hospitality",
    text: "Every stay is shaped around comfort, warmth, and genuine care.",
  },
  {
    icon: "bi bi-stars",
    title: "Luxury Standards",
    text: "We blend refined design with attentive service in every experience.",
  },
  {
    icon: "bi bi-shield-check",
    title: "Trust & Safety",
    text: "Guest confidence is supported by consistent, dependable service.",
  },
];

const team = [
  {
    name: "Lara Thompson",
    role: "General Manager",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "David Silva",
    role: "Head of Concierge",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sophia Reed",
    role: "Guest Experience Lead",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="page-banner small-banner">
        <div className="container h-100 d-flex align-items-center">
          <div>
            <p className="section-tag mb-2">ABOUT US</p>
            <h1 className="page-title mb-0">
              Crafting Refined Hotel Experiences
            </h1>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury hotel exterior"
                className="img-fluid rounded-4 shadow"
                style={{ height: 500, objectFit: "cover", width: "100%" }}
              />
            </div>

            <div className="col-lg-6">
              <p className="section-tag text-primary mb-2">OUR STORY</p>
              <h2 className="section-title mb-3">
                A place where comfort meets elegance.
              </h2>
              <p className="text-secondary mb-3">
                Khosti Restaurant was created to offer guests a refined dining
                experience built on warm hospitality, elevated design, and
                exceptional service.
              </p>
              <p className="text-secondary mb-0">
                From early morning wellness rituals to late-night dining
                experiences, every detail is designed to make each guest feel
                genuinely cared for.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row g-4 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="col-md-3 col-sm-6">
                <div className="stat-box">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <p className="section-tag text-primary mb-2">WHY WE STAND OUT</p>
            <h2 className="section-title mb-0">What makes us different</h2>
          </div>

          <div className="row g-4">
            {values.map((item) => (
              <div key={item.title} className="col-lg-4 col-md-6">
                <div className="feature-box h-100 text-center">
                  <i className={`${item.icon} fs-2 text-primary`}></i>
                  <h4 className="mt-3 mb-3">{item.title}</h4>
                  <p className="text-secondary mb-0">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <p className="section-tag text-primary mb-2">MEET THE TEAM</p>
            <h2 className="section-title mb-0">
              Hospitality experts behind every stay
            </h2>
          </div>

          <div className="row g-4">
            {team.map((member) => (
              <div key={member.name} className="col-lg-4 col-md-6">
                <div className="team-card">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="team-image"
                  />
                  <div className="p-4 text-center">
                    <h4 className="mb-1">{member.name}</h4>
                    <p className="text-primary fw-semibold mb-0">
                      {member.role}
                    </p>
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

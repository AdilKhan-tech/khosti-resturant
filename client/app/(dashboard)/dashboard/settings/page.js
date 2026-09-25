import DashboardShell from "../../../../components/dashboard/DashboardShell";

export default function SettingsPage() {
  return (
    <DashboardShell
      eyebrow="Administration"
      title="Settings"
      action={
        <button type="button" className="btn btn-primary px-4 py-3">
          <i className="bi bi-check2 me-2"></i>Save changes
        </button>
      }
    >
      <section className="dashboard-page-content">
        <div className="row g-4">
          <div className="col-xl-8">
            <div className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="section-tag mb-1">Property profile</p>
                  <h3>Hotel information</h3>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Hotel name</label>
                  <input
                    className="form-control dashboard-form-control"
                    defaultValue="Khosti Restaurant"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contact email</label>
                  <input
                    type="email"
                    className="form-control dashboard-form-control"
                    defaultValue="hello@khostirestaurant.com"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone number</label>
                  <input
                    className="form-control dashboard-form-control"
                    defaultValue="+1 555 010 2026"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Timezone</label>
                  <select
                    className="form-select dashboard-select w-100"
                    defaultValue="eastern"
                  >
                    <option value="eastern">Eastern Time (ET)</option>
                    <option>Central European Time</option>
                    <option>Arabian Standard Time</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Hotel address</label>
                  <input
                    className="form-control dashboard-form-control"
                    defaultValue="24 Garden Avenue, New York"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <p className="section-tag mb-1">Preferences</p>
                  <h3>Notifications</h3>
                </div>
              </div>
              <div className="settings-toggle">
                <div>
                  <strong>Booking alerts</strong>
                  <small>Notify staff about new bookings</small>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="settings-toggle">
                <div>
                  <strong>Payment alerts</strong>
                  <small>Notify finance about payments</small>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="settings-toggle">
                <div>
                  <strong>Review alerts</strong>
                  <small>Notify manager about reviews</small>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

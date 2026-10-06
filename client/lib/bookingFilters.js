const statusGroups = {
  "All bookings": [],
  Confirmed: ["Confirmed", "Checked in"],
  Pending: ["Pending"],
  Cancelled: ["Cancelled"],
};

function getBookingTabMatches(tab) {
  return statusGroups[tab] ?? [];
}

function filterBookings(bookings, activeTab) {
  const matches = getBookingTabMatches(activeTab);

  if (!activeTab || activeTab === "All bookings" || matches.length === 0) {
    return bookings;
  }

  return bookings.filter((booking) => matches.includes(booking.status));
}

module.exports = {
  filterBookings,
  getBookingTabMatches,
};

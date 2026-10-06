const test = require("node:test");
const assert = require("node:assert/strict");

const { filterBookings, getBookingTabMatches } = require("./bookingFilters");

const bookings = [
  { id: "BK-2048", status: "Confirmed" },
  { id: "BK-2047", status: "Checked in" },
  { id: "BK-2046", status: "Pending" },
  { id: "BK-2044", status: "Cancelled" },
];

test("all bookings returns every row", () => {
  assert.equal(filterBookings(bookings, "All bookings").length, 4);
});

test("confirmed tab includes confirmed and checked in bookings", () => {
  const filtered = filterBookings(bookings, "Confirmed");
  assert.deepEqual(
    filtered.map((booking) => booking.id),
    ["BK-2048", "BK-2047"],
  );
});

test("pending tab filters pending rows", () => {
  assert.deepEqual(
    filterBookings(bookings, "Pending").map((booking) => booking.id),
    ["BK-2046"],
  );
});

test("cancelled tab filters cancelled rows", () => {
  assert.deepEqual(
    filterBookings(bookings, "Cancelled").map((booking) => booking.id),
    ["BK-2044"],
  );
});

test("tab matcher keeps status aliases aligned with UI labels", () => {
  assert.equal(getBookingTabMatches("Confirmed").includes("Checked in"), true);
  assert.equal(getBookingTabMatches("Pending").includes("Pending"), true);
  assert.equal(getBookingTabMatches("Cancelled").includes("Cancelled"), true);
});

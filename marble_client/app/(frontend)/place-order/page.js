"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Checkout() {
  const cartItems = [
    {
      id: 1,
      name: "We dream and achieve cookie cake",
      quantity: 1,
      price: 173.0,
    },
  ];

  const [selectedMethod, setSelectedMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("bank");

  const subtotal = 173.0;
  const deliveryFee = selectedMethod === "delivery" ? 15.0 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-vh-100 bg-page-light">
      <div className="container py-5">
        {/* Page Header */}
        <div className="row mb-5">
          <div className="col-12">
            <h1 className="display-4 fw-bold text-dark mb-2">Checkout</h1>
            <p className="text-secondary-emphasis fs-5">
              Complete your order to enjoy our delicious treats
            </p>
          </div>
        </div>

        <div className="row g-5">
          {/* LEFT COLUMN - Form Section */}
          <div className="col-lg-7">
            {/* Progress Steps */}
            <div className="d-flex justify-content-between mb-5 px-2">
              <div className="text-center flex-fill">
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-2 size-40"
                >
                  <i className="bi bi-cart-check fs-5" aria-hidden="true"></i>
                </div>
                <small className="text-success fw-semibold">Cart</small>
              </div>
              <div className="text-center flex-fill">
                <div
                  className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center mx-auto mb-2 size-40"
                >
                  <i className="bi bi-file-text fs-5" aria-hidden="true"></i>
                </div>
                <small className="text-info fw-semibold">Details</small>
              </div>
              <div className="text-center flex-fill">
                <div
                  className="rounded-circle bg-secondary bg-opacity-25 text-secondary d-flex align-items-center justify-content-center mx-auto mb-2 size-40"
                >
                  <i className="bi bi-credit-card fs-5" aria-hidden="true"></i>
                </div>
                <small className="text-secondary">Payment</small>
              </div>
            </div>

            {/* Gift Option */}
            <div className="rounded-4 mb-4 border-start border-4 border-warning bg-white p-4">
              <div className="form-check">
                <input
                  className="form-check-input form-check-input-lg"
                  type="checkbox"
                  id="giftOption"
                />
                <label
                  className="form-check-label fw-semibold ms-2 text-gift"
                  htmlFor="giftOption"
                >
                  <i className="bi bi-gift-fill me-2 text-warning" aria-hidden="true"></i>
                  Do you want to gift this product? (Includes gift wrapping
                  and personalized message)
                </label>
              </div>
            </div>

            {/* Delivery/Pickup Toggle */}
            <div className="rounded-4 mb-4 bg-white p-4">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-truck me-2 text-info" aria-hidden="true"></i>
                Receiving Method
              </h6>
              <div className="d-flex gap-3">
                <button
                  onClick={() => setSelectedMethod("delivery")}
                  className={`btn px-4 py-2 rounded-pill fw-semibold ${
                    selectedMethod === "delivery"
                      ? "btn-info text-white"
                      : "btn-outline-secondary"
                  }`}
                >
                  <i className="bi bi-truck me-2" aria-hidden="true"></i>
                  Delivery
                </button>
                <button
                  onClick={() => setSelectedMethod("pickup")}
                  className={`btn px-4 py-2 rounded-pill fw-semibold ${
                    selectedMethod === "pickup"
                      ? "btn-info text-white"
                      : "btn-outline-secondary"
                  }`}
                >
                  <i className="bi bi-shop me-2" aria-hidden="true"></i>
                  Pickup
                </button>
              </div>
            </div>

            {/* Delivery/Pickup Details */}
            {selectedMethod === "pickup" ? (
              <div className="rounded-4 mb-4 bg-soft-cream-gradient p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">
                    <i className="bi bi-geo-alt-fill me-2 text-info" aria-hidden="true"></i>
                    Pickup Location
                  </h6>
                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3">
                    <i className="bi bi-pencil" aria-hidden="true"></i> Change
                  </button>
                </div>
                <div className="bg-white rounded-3 p-3 mb-3">
                  <div className="d-flex gap-3 align-items-start">
                    <i className="bi bi-shop text-info fs-4" aria-hidden="true"></i>
                    <div>
                      <p className="fw-semibold mb-1">Al Rawdah Branch</p>
                      <p className="text-secondary small mb-1">
                        Prince Sultan Rd, Ar Rawdah, Jeddah 23433
                      </p>
                      <p className="text-secondary small mb-0">
                        +966 12 345 6789
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold" htmlFor="pickupDate">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="pickupDate"
                      className="form-control rounded-3"
                      defaultValue="2026-03-30"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold" htmlFor="pickupTime">
                      Time Slot
                    </label>
                    <select
                      id="pickupTime"
                      className="form-select rounded-3"
                      defaultValue="4-6"
                    >
                      <option value="10-12">10:00 AM - 12:00 PM</option>
                      <option value="4-6">4:00 PM - 6:00 PM</option>
                      <option value="7-9">7:00 PM - 9:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-4 mb-4 bg-white p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">
                    <i className="bi bi-house-door me-2 text-info" aria-hidden="true"></i>
                    Delivery Address
                  </h6>
                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3">
                    <i className="bi bi-plus" aria-hidden="true"></i> Add New
                  </button>
                </div>
                <div className="border rounded-3 p-3 mb-3 bg-light">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="address"
                      id="address1"
                      defaultChecked
                    />
                    <label
                      className="form-check-label ms-2"
                      htmlFor="address1"
                    >
                      <p className="fw-semibold mb-1">Zad Modern</p>
                      <p className="text-secondary small mb-1">
                        Prince Sultan Rd, Ar Rawdah, Jeddah 23433
                      </p>
                      <p className="text-secondary small mb-0">
                        +966 536741445
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Recipient's Data */}
            <div className="rounded-4 mb-4 bg-white p-4">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-person-circle me-2 text-info" aria-hidden="true"></i>
                Recipient&apos;s Information
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small" htmlFor="recipientName">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    className="form-control rounded-3 py-2"
                    defaultValue="Zad Modern"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small" htmlFor="recipientEmail">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    className="form-control rounded-3 py-2"
                    defaultValue="zad@example.com"
                    placeholder="Enter email"
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-semibold small" htmlFor="recipientPhone">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    id="recipientPhone"
                    className="form-control rounded-3 py-2"
                    defaultValue="+966 536741445"
                    placeholder="Enter phone number"
                  />
                </div>
                {selectedMethod === "delivery" && (
                  <div className="col-12">
                    <label className="form-label fw-semibold small" htmlFor="deliveryInstructions">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      id="deliveryInstructions"
                      className="form-control rounded-3"
                      rows={2}
                      placeholder="Gate code, building name, special instructions..."
                    ></textarea>
                  </div>
                )}
              </div>
            </div>

            {/* Discount */}
            <div className="rounded-4 mb-4 bg-white p-4">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-ticket-perforated me-2 text-info" aria-hidden="true"></i>
                Have a Promo Code?
              </h6>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control border-end-0 rounded-end-0 rounded-start-3 py-2"
                  placeholder="Enter promo code"
                  aria-label="Promo code"
                />
                <button
                  className="btn px-4 rounded-end-3 fw-semibold text-white bg-brand-teal"
                >
                  Apply
                </button>
              </div>
              <small className="text-secondary mt-2 d-block">
                <i className="bi bi-info-circle" aria-hidden="true"></i> Enjoy 10% off on orders
                above 200 SR
              </small>
            </div>
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="col-lg-5">
            <div className="position-sticky sticky-top-20">
              <div className="rounded-4 mb-4 bg-white p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold mb-0">Order Summary</h3>
                  <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* Cart Items */}
                <div className="mb-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between align-items-center py-2"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-medium text-dark">
                          {item.name}
                        </span>
                        <span className="text-secondary small bg-light px-2 py-1 rounded">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="fw-semibold text-brand-teal">
                        {item.price.toFixed(2)} SR
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-secondary-subtle" />

                {/* Totals */}
                <div className="d-flex justify-content-between py-2">
                  <span className="text-secondary">Subtotal</span>
                  <span className="fw-medium">{subtotal.toFixed(2)} SR</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-secondary">Delivery Fee</span>
                    <span className="fw-medium">
                      {deliveryFee.toFixed(2)} SR
                    </span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between align-items-center py-2">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="fw-bold fs-4 text-brand-pink">
                    {total.toFixed(2)} SR
                  </span>
                </div>

                <div className="bg-light rounded-3 p-3 my-3">
                  <small className="text-secondary d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history" aria-hidden="true"></i>
                    Estimated delivery:{" "}
                    {selectedMethod === "delivery"
                      ? "2-3 business days"
                      : "Ready for pickup in 1 hour"}
                  </small>
                </div>

                <hr />

                {/* Payment Methods */}
                <div className="mt-2">
                  <h6 className="fw-bold mb-3">Select Payment Method</h6>

                  <div
                    className={`border rounded-3 p-3 mb-3 ${paymentMethod === "bank" ? "border-info bg-info bg-opacity-10" : "border-secondary"}`}
                  >
                    <div className="form-check">
                      <input
                        className="form-check-input cursor"
                        type="radio"
                        name="paymentMethod"
                        id="bankTransfer"
                        checked={paymentMethod === "bank"}
                        onChange={() => setPaymentMethod("bank")}
                      />
                      <label
                        className="form-check-label fw-semibold ms-2"
                        htmlFor="bankTransfer"
                      >
                        <i className="bi bi-bank me-2" aria-hidden="true"></i>
                        Direct Bank Transfer
                      </label>
                    </div>
                    {paymentMethod === "bank" && (
                      <small className="text-secondary d-block mt-2 ms-4 ps-3">
                        Make payment to: SA 594xxxxxxxxxx •
                        Reference: Order ID
                      </small>
                    )}
                  </div>

                  <div
                    className={`border rounded-3 p-3 mb-3 ${paymentMethod === "card" ? "border-info bg-info bg-opacity-10" : "border-secondary"}`}
                  >
                    <div className="form-check">
                      <input
                        className="form-check-input cursor"
                        type="radio"
                        name="paymentMethod"
                        id="cardPayment"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                      />
                      <label
                        className="form-check-label fw-semibold ms-2"
                        htmlFor="cardPayment"
                      >
                        <i className="bi bi-credit-card me-2" aria-hidden="true"></i>
                        Credit / Debit Card
                      </label>
                    </div>
                    {paymentMethod === "card" && (
                      <div className="mt-2 ms-4 ps-3">
                        <div className="d-flex gap-2 mb-2">
                          <img
                            src="https://img.icons8.com/color/24/visa.png"
                            alt="Visa"
                          />
                          <img
                            src="https://img.icons8.com/color/24/mastercard.png"
                            alt="Mastercard"
                          />
                          <img
                            src="https://img.icons8.com/color/24/amex.png"
                            alt="American Express"
                          />
                        </div>
                        <small className="text-secondary">
                          Secure payment powered by Stripe
                        </small>
                      </div>
                    )}
                  </div>

                  <div
                    className={`border rounded-3 p-3 ${paymentMethod === "cod" ? "border-info bg-info bg-opacity-10" : "border-secondary"}`}
                  >
                    <div className="form-check">
                      <input
                        className="form-check-input cursor"
                        type="radio"
                        name="paymentMethod"
                        id="cashOnDelivery"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <label
                        className="form-check-label fw-semibold ms-2"
                        htmlFor="cashOnDelivery"
                      >
                        <i className="bi bi-cash-stack me-2" aria-hidden="true"></i>
                        Cash on Delivery
                      </label>
                    </div>
                    <small className="text-secondary d-block mt-1 ms-4 ps-3">
                      Pay when your order arrives
                    </small>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  className="btn w-100 mt-4 py-3 text-white fw-bold rounded-pill bg-brand-pink-gradient"
                >
                  <i className="bi bi-lock-fill me-2" aria-hidden="true"></i>
                  Place Order &bull; {total.toFixed(2)} SR
                </button>

                {/* Trust Badges */}
                <div className="d-flex flex-wrap justify-content-center gap-4 mt-4">
                  <small className="text-secondary">
                    <i className="bi bi-shield-check text-success" aria-hidden="true"></i> Secure Checkout
                  </small>
                  <small className="text-secondary">
                    <i className="bi bi-arrow-repeat text-info" aria-hidden="true"></i> 30-Day Returns
                  </small>
                  <small className="text-secondary">
                    <i className="bi bi-headset text-warning" aria-hidden="true"></i> 24/7 Support
                  </small>
                </div>
              </div>

              {/* Privacy Policy */}
              <small className="text-secondary d-flex gap-2 align-items-start">
                <i className="bi bi-shield-check text-info mt-1" aria-hidden="true"></i>
                <span>
                  Your personal data will be used to process your order,
                  support your experience throughout this website, and for
                  other purposes described in our{" "}
                  <Link href="/privacy" className="text-decoration-none">
                    privacy policy
                  </Link>
                  .
                </span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

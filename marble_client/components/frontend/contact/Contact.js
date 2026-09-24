"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getLocalizedLabel,
  getLocalizedValue,
} from "@/utils/localizedContent";
import { loadGoogleMapsScript } from "@/utils/googleMaps";

const DEFAULT_CONTACT = {
  hotline: "920011480",
  whatsapp: "+966594064708",
  email: "info@marblestore.com",
};

function formatAnswer(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatBranchNumber(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (value.startsWith("+966")) return value;
  return `+966 ${value.replace(/^0+/, "")}`;
}

function whatsappHref(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

function branchLatLng(branch) {
  const lat = parseFloat(branch?.latitude);
  const lng = parseFloat(branch?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function Contact({
  language = "en",
  faqs = [],
  branches = [],
  contact = DEFAULT_CONTACT,
}) {
  const t = (labelKey, fallback) =>
    getLocalizedLabel(labelKey, language, fallback);

  const hotline = contact.hotline || DEFAULT_CONTACT.hotline;
  const whatsapp = contact.whatsapp || DEFAULT_CONTACT.whatsapp;
  const email = contact.email || DEFAULT_CONTACT.email;

  const cities = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const branch of branches) {
      const city =
        language === "ar"
          ? branch.city_ar || branch.city || ""
          : branch.city || branch.city_ar || "";
      const key = String(branch.city || city).trim();
      if (!key || seen.has(key)) continue;
      if (key.toLowerCase() === "other") continue;
      seen.add(key);
      list.push({
        key,
        label: city || key,
      });
    }
    return list;
  }, [branches, language]);

  const defaultCity =
    cities.find((c) => /jeddah/i.test(c.key))?.key || cities[0]?.key || "";

  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const cityBranches = useMemo(() => {
    return branches.filter((branch) => {
      const cityKey = String(branch.city || "").trim();
      return cityKey === selectedCity && branchLatLng(branch);
    });
  }, [branches, selectedCity]);

  useEffect(() => {
    if (!selectedCity && defaultCity) setSelectedCity(defaultCity);
  }, [defaultCity, selectedCity]);

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  const showBranchesOnMap = (list) => {
    if (!window.google?.maps || !mapRef.current) return;

    const bounds = new window.google.maps.LatLngBounds();
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 10,
      mapTypeId: "roadmap",
    });
    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();
    clearMarkers();

    list.forEach((branch) => {
      const position = branchLatLng(branch);
      if (!position) return;
      const name =
        language === "ar"
          ? branch.name_ar || branch.name_en
          : branch.name_en || branch.name_ar;

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: name,
      });

      marker.addListener("click", () => {
        const googleMapsLink = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
        infoWindowRef.current.setContent(
          `<div><strong>${name || ""}</strong><br>Address: ${
            branch.address || ""
          }<br><a href="${googleMapsLink}" target="_blank" rel="noreferrer">View on Google Maps</a></div>`,
        );
        infoWindowRef.current.open(map, marker);
        setSelectedBranchId(branch.id);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (list.length) {
      map.fitBounds(bounds);
    }
  };

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !selectedCity) return;

    let cancelled = false;
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (cancelled) return;
        showBranchesOnMap(cityBranches);
        setSelectedBranchId(cityBranches[0]?.id ?? null);
      })
      .catch(() => {
        /* map optional if key fails */
      });

    return () => {
      cancelled = true;
      clearMarkers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, cityBranches, language]);

  const highlightBranch = (branch) => {
    setSelectedBranchId(branch.id);
    const position = branchLatLng(branch);
    if (!position || !markersRef.current.length || !infoWindowRef.current) {
      return;
    }
    const name =
      language === "ar"
        ? branch.name_ar || branch.name_en
        : branch.name_en || branch.name_ar;
    const marker = markersRef.current.find((m) => {
      const p = m.getPosition();
      return (
        p &&
        Math.abs(p.lat() - position.lat) < 1e-6 &&
        Math.abs(p.lng() - position.lng) < 1e-6
      );
    });
    if (!marker) return;
    const googleMapsLink = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
    infoWindowRef.current.setContent(
      `<div><strong>${name || ""}</strong><br>Address: ${
        branch.address || ""
      }<br><a href="${googleMapsLink}" target="_blank" rel="noreferrer">View on Google Maps</a></div>`,
    );
    infoWindowRef.current.open(mapInstanceRef.current, marker);
  };

  const selectedCityLabel =
    cities.find((c) => c.key === selectedCity)?.label || selectedCity;

  return (
    <section className="contact-us-page">
      {/* Top contact strip — WP social-icons-section */}
      <div className="container px-3 py-4 bg-contact-scndsection">
        <div className="row g-4 g-md-0 align-items-center text-center text-md-start">
          <div className="col-md-4 d-flex justify-content-center align-items-center gap-3">
            <img
              className="img-height-contact"
              src="/assets/images/call-contact.png"
              alt=""
            />
            <span className="line-height text-start">
              <h4 className="customer-hotline text-white mb-1">
                {t("lblCustomerHotline", "Customer hotline")}
              </h4>
              <a className="text-white text-decoration-none" href={`tel:${hotline}`}>
                <p className="customer-p fs-20 text-white mb-0">{hotline}</p>
              </a>
            </span>
          </div>

          <div className="col-md-4 d-flex justify-content-center align-items-center gap-3">
            <img
              className="img-height-contact"
              src="/assets/images/whatsapp-contact.png"
              alt=""
            />
            <span className="line-height text-start">
              <h4 className="customer-hotline text-white mb-1">
                {t("lblWhatsapp", "WhatsApp")}
              </h4>
              <a
                className="text-white text-decoration-none"
                href={whatsappHref(whatsapp)}
                target="_blank"
                rel="noreferrer"
              >
                <p className="customer-p fs-20 text-white mb-0">{whatsapp}</p>
              </a>
            </span>
          </div>

          <div className="col-md-4 d-flex justify-content-center align-items-center gap-3">
            <img
              className="img-height-contact"
              src="/assets/images/email-contact.png"
              alt=""
            />
            <span className="line-height text-start">
              <h4 className="customer-hotline text-white mb-1">
                {t("lblEmail", "E-mail")}
              </h4>
              <a
                className="text-white text-decoration-none"
                href={`mailto:${email}`}
              >
                <p className="customer-p fs-20 text-white mb-0">{email}</p>
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* Visit us + map */}
      <section id="visitus" className="bg-map-contact">
        <div className="container px-3 px-md-5 py-5">
          <div className="row g-4 align-items-stretch">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3 gap-md-4 flex-wrap">
                <h2 className="fs-72 visit-us-contact mb-0">
                  {t("lblVisitUs", "Visit us")}
                </h2>
                <img
                  className="sticker-visi-contact"
                  src="/assets/images/sticker-contact-visist.png"
                  alt=""
                />
              </div>

              <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
                <h4 className="fs-35 our-stories-visit mb-0">
                  {t("lblOurStoresIn", "Our Stores in")}
                </h4>
                <div className="dropdown">
                  <button
                    className="dropdown-toggle fs-35 our-Jeddah-visit jedda-btn-visit px-0"
                    type="button"
                    id="contactCityDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {selectedCityLabel || t("lblJeddah", "Jeddah")}
                  </button>
                  <ul
                    className="dropdown-menu dropdown-visit"
                    aria-labelledby="contactCityDropdown"
                  >
                    {cities.map((city) => (
                      <li key={city.key}>
                        <button
                          type="button"
                          className="dropdown-item fs-24 dropdown-list-font"
                          onClick={() => setSelectedCity(city.key)}
                        >
                          {city.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="img-jeddah mt-3">
                <div className="img-jedda d-flex flex-column gap-1">
                  {cityBranches.length === 0 ? (
                    <p className="text-secondary mb-0">
                      {t("lblNoStores", "No stores found for this city.")}
                    </p>
                  ) : (
                    cityBranches.map((branch) => {
                      const name =
                        language === "ar"
                          ? branch.name_ar || branch.name_en
                          : branch.name_en || branch.name_ar;
                      const phone = formatBranchNumber(branch.number);
                      const active = selectedBranchId === branch.id;
                      return (
                        <button
                          type="button"
                          key={branch.id}
                          className={`show-map-address py-2 px-3 text-start border-0 w-100 ${
                            active ? "bg-field1" : "bg-fieldss"
                          }`}
                          onClick={() => highlightBranch(branch)}
                        >
                          <span className="fs-20 dropdown-list-font-centers d-block">
                            {name}
                          </span>
                          <span className="fs-16 font-fam-address d-block mt-1">
                            <i className="bi bi-geo-alt me-1" aria-hidden="true"></i>
                            {branch.address}
                          </span>
                          {phone ? (
                            <span className="fs-16 d-block mt-1">
                              <i className="bi bi-telephone me-1" aria-hidden="true"></i>
                              {phone}
                            </span>
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-8 d-flex">
              <div
                ref={mapRef}
                id="map"
                className="img-height-contact-map w-100 h-100 rounded-3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faqsec" className="bg-faq-contact position-relative">
        <div className="container px-3 px-md-5 py-5">
          <img
            className="faq-sticker d-none d-md-block"
            src="/assets/images/faq-sticker-contact.png"
            alt=""
          />
          <div className="faq-head text-center mb-4">
            <h2 className="fs-72 faq-text-contact mb-2">
              {t("lblFaq", "FAQ")}
            </h2>
            <h4 className="fs-32 Frequently-ask-contact mb-0">
              {t("lblFrequentlyAskQuestions", "Frequently Ask Questions")}
            </h4>
          </div>

          {faqs.length === 0 ? (
            <p className="text-center text-secondary mb-0">
              {t("lblNoFaqs", "No FAQs available right now.")}
            </p>
          ) : (
            <div className="accordion bckg-faq-none" id="faqAccordion">
              {faqs.map((faq, index) => {
                const collapseId = `faq-${faq.id}`;
                const question = getLocalizedValue(
                  faq.question_en,
                  faq.question_ar,
                  language,
                );
                const answerLines = formatAnswer(
                  getLocalizedValue(faq.answer_en, faq.answer_ar, language),
                );
                const isFirst = index === 0;

                return (
                  <div className="accordion-item bckg-faq-none border-0" key={faq.id}>
                    <h2 className="accordion-header faq-accordion bckg-faq-none">
                      <button
                        className={`accordion-button faq-acordian-btn fs-30 how-place-order bckg-faq-none shadow-none${
                          isFirst ? "" : " collapsed"
                        }`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${collapseId}`}
                        aria-expanded={isFirst}
                        aria-controls={collapseId}
                      >
                        {question}
                      </button>
                    </h2>
                    <div
                      id={collapseId}
                      className={`accordion-collapse collapse${isFirst ? " show" : ""}`}
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body bckg-faq-none fs-20">
                        {answerLines.map((line, lineIndex) => (
                          <p key={`${faq.id}-${lineIndex}`} className="mb-2">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default Contact;

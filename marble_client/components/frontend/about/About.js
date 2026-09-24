"use client";

import React from "react";
import { getLocalizedValue } from "@/utils/localizedContent";

const COPY = {
  ourStory: { en: "Our Story", ar: "قصتنا" },
  ourStoryDesc: {
    en: "marble slab creamery has been serving fresh homemade ice cream since 1983. Our name refers to the magical frozen marble slab where all the mixins and fun happens. Today we're known as one of the best sweet shops serving fresh customizable ice creams, cookies and cakes. Our mission is spreading love by making everyday a fun celebration for ourselves and others.",
    ar: "نقدم في ماربل سالب كريمي آيس كريم محلي الصنع منذ عام ١٩٨٣م، حيث يجسد اسمنا الرخام المجمد السحري ويعكس مرح المزج، ونتميز اليوم بتقديم أنواع مختلفة وطازجة من الآيس كريم والكيك والكوكيز، مهمتنا هي نشر الحب وجعل كل يوم احتفالًا ممتعًا.",
  },
  whyDifferent: { en: "Why are we different?", ar: "ما الذي يميزنا؟" },
  creativity: {
    en: "Creativity and Customization",
    ar: "الابداع هو الذكاء مع الاستمتاع",
  },
  creativityQuote: {
    en: "Creativity is intelligence having fun",
    ar: "ابداعنا في صناعاتنا للمرح",
  },
  funExperience: { en: "Fun Experience", ar: "تجربة ممتعة" },
  funQuote: {
    en: "Life is all about having fun",
    ar: "معنى الحياة يمكن في المتعة",
  },
  spreadingLove: { en: "Spreading love", ar: "نشر الحب" },
  spreadingQuote: {
    en: "Every day is a great day to give love, spread joy, and sparkle",
    ar: "كل يوم هو فرصة ذهبية لنشر الحب والسعادة والتألق",
  },
  ourPartners: { en: "Our partners", ar: "شركاؤنا" },
  marbleName: { en: "Marble Slab Creamery", ar: "ماربل سلاب كريمري" },
  marbleDesc: {
    en: "A leading purveyor of chef created super-premium hand-mixed ice cream and the innovator of the frozen slab technique, well known in the United States.",
    ar: "ابتكر أحد القادة الموردين للطهاة آيس كريم عالي الجودة مخلوط يدويًا، وهو مبتكر تقنية الألواح المجمدة الشهيرة في الولايات المتحدة.",
  },
  gaName: { en: "Great American Cookies", ar: "جريت أمريكان كوكيز" },
  gaDesc: {
    en: "At Great American Cookies, you may indulge in freshly baked sweets that blend classic flavors with inventive creations. Ideal as a wonderful treat or for any occasion!",
    ar: "تقدم ڨريت أميركان كوكيز تشكيلة متنوعة من الكوكيز الطازجة و المخبوزة، المثالية لكل مناسبة. دلل نفسك بالنكهات الشهية المثالية لأي احتفال أو كوجبة خفيفة شهية",
  },
};

function t(key, language) {
  const row = COPY[key];
  if (!row) return key;
  return getLocalizedValue(row.en, row.ar, language, row.en);
}

function About({ language = "en" }) {
  return (
    <section className="about-us-page">
      {/* Hero — Our Story */}
      <div className="container-fluid px-0">
        <div className="container about-us-hero-section position-relative overflow-hidden">
          <div className="row align-items-center g-4 py-4 py-md-5">
            <div className="col-md-6 px-3 px-md-5">
              <h2 className="marble-store-about-us fs-72 mb-0">
                {t("ourStory", language)}
              </h2>
              <div className="text-about-us-section about-us-banner-text fs-22 mt-4 mt-md-5">
                <p className="mb-0">{t("ourStoryDesc", language)}</p>
              </div>
            </div>
            <div className="col-md-6 text-center px-3 px-md-5">
              <img
                src="/assets/images/about-us-banner.png"
                className="img-fluid about-hero-img"
                alt={t("ourStory", language)}
              />
            </div>
          </div>
          <img
            className="about-us-sticker d-none d-md-block"
            src="/assets/images/about-us-sticker.png"
            alt=""
          />
        </div>
      </div>

      {/* Why are we different */}
      <div className="why-different">
        <div className="container py-4 py-md-5">
          <h2 className="text-center fs-85 why-dif-text px-2 px-md-5 mb-4 mb-md-5">
            {t("whyDifferent", language)}
          </h2>

          <div className="row align-items-center g-4 mb-4 mb-md-5">
            <div className="col-md-6 text-center">
              <img
                src="/assets/images/create-custom1.png"
                className="img-fluid about-feature-img"
                alt=""
              />
            </div>
            <div className="col-md-6">
              <h3 className="fs-44 font-brandon-black mb-2">
                {t("creativity", language)}
              </h3>
              <p className="fs-25 fw-medium we-happy-txt-about mb-0">
                &quot;{t("creativityQuote", language)}&quot;
              </p>
            </div>
          </div>

          <div className="row align-items-center g-4 mb-4 mb-md-5 flex-md-row-reverse">
            <div className="col-md-6 text-center">
              <img
                src="/assets/images/gifts.png"
                className="img-fluid about-feature-img"
                alt=""
              />
            </div>
            <div className="col-md-6">
              <h3 className="fs-44 font-brandon-black mb-2">
                {t("funExperience", language)}
              </h3>
              <p className="fs-25 fw-medium we-happy-txt-about mb-0">
                &quot;{t("funQuote", language)}&quot;
              </p>
            </div>
          </div>

          <div className="row align-items-center g-4 pb-md-4">
            <div className="col-md-6 text-center">
              <img
                src="/assets/images/funfairs.png"
                className="img-fluid about-feature-img"
                alt=""
              />
            </div>
            <div className="col-md-6">
              <h3 className="fs-44 font-brandon-black mb-2">
                {t("spreadingLove", language)}
              </h3>
              <p className="fs-25 fw-medium we-happy-txt-about mb-0">
                &quot;{t("spreadingQuote", language)}&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our partners */}
      <div className="our-partners-section">
        <div className="container py-4 py-md-5 position-relative">
          <h2 className="fs-85 our-partner-text text-center px-2 px-md-5 mb-4 mb-md-5">
            {t("ourPartners", language)}
          </h2>

          <div className="row g-5 text-center our-partner-portion position-relative">
            <div className="col-md-6">
              <img
                src="/assets/images/marble-slab-about.png"
                className="about-partner-logo mb-3"
                alt={t("marbleName", language)}
              />
              <h4 className="fs-35 fnt-partner">{t("marbleName", language)}</h4>
              <p className="fs-20 partner-descr-text px-md-3 mb-3">
                {t("marbleDesc", language)}
              </p>
              <a
                href="https://marbleslab.com"
                target="_blank"
                rel="noreferrer"
                className="fs-24 marbleslab text-decoration-none me-3"
              >
                marbleslab.com
              </a>
              <span className="d-inline-flex align-items-center gap-2 mt-2 marbleslabsa">
                <img
                  src="/assets/images/insta-about.png"
                  width={33}
                  height={32}
                  alt=""
                />
                <span className="fs-24 marbleslabksa">@marbleslabksa</span>
              </span>
            </div>

            <div className="col-md-6">
              <img
                src="/assets/images/American-slab-about.png"
                className="about-partner-logo mb-3"
                alt={t("gaName", language)}
              />
              <h4 className="fs-35 fnt-partner">{t("gaName", language)}</h4>
              <p className="fs-20 partner-descr-text px-md-3 mb-3">
                {t("gaDesc", language)}
              </p>
              <a
                href="https://greatamericancookies.com"
                target="_blank"
                rel="noreferrer"
                className="fs-24 greatamerican text-decoration-none"
              >
                greatamericancookies.com
              </a>
            </div>

            <img
              className="great-american-sticker d-none d-lg-block"
              src="/assets/images/about-portion-sticker.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;

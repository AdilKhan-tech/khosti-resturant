"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createCustomCakeQuoteRoute } from "@/utils/apiRoutes";
import DeliveryPickupModal, { getSavedReceivingInfo } from "@/components/frontend/product/DeliveryPickupModal";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";

function optionName(item, language) {
  return getLocalizedValue(item?.name_en, item?.name_ar, language);
}

function optionSnapshot(item) {
  if (!item) return null;
  return {
    id: item.id,
    name_en: item.name_en || "",
    name_ar: item.name_ar || "",
    slug: item.slug,
  };
}

function MakeCake({ cakeTypes = [], branches = [], baseProduct = null, language = "en" }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [cakeText, setCakeText] = useState("");
  const [cakeNote, setCakeNote] = useState("");
  const [sketchFile, setSketchFile] = useState(null);
  const [colorText, setColorText] = useState("");
  const [borderColor, setBorderColor] = useState("");
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceivingModal, setShowReceivingModal] = useState(false);

  const handleSelectType = (type) => {
    setSelectedType(type);
    setSelectedSize(null);
    setSelectedFlavor(null);
  };

  const handleSketchChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setSketchFile(null);
      setErrors([t("lblSketchTooLarge")]);
      event.target.value = "";
      return;
    }
    setSketchFile(file);
  };

  const selectedTypeEnglishName = selectedType?.name_en || "";
  const isCookieCake = selectedTypeEnglishName.toLowerCase() === "cookie cake";
  const isIceCreamCake =
    selectedTypeEnglishName.trim().toLowerCase() === "ice cream cake" ||
    selectedType?.slug?.trim().toLowerCase() === "ice-cream-cake";

  const getSketchStep = () => {
    let step = 2;
    if (selectedType?.sizes?.length > 0) step++;
    if (selectedType?.flavors?.length > 0 && selectedType?.sizes?.length > 0) step++;
    return step;
  };

  const getTextStep = () => getSketchStep() + 1;

  const openLoginPopup = useCallback(() => {
    if (typeof window === "undefined") return;

    const modalElement = document.getElementById("myModal");
    if (modalElement && window.bootstrap?.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
      return;
    }

    document.querySelector('[data-bs-target="#myModal"]')?.click();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      openLoginPopup();
    }
  }, [openLoginPopup, status]);

  const validateSelections = () => {
    const nextErrors = [];
    if (!baseProduct?.id) nextErrors.push(t("lblCustomCakeUnavailable"));
    if (!selectedType) nextErrors.push(t("lblSelectCakeTypeError"));
    if (selectedType?.sizes?.length > 0 && !selectedSize) nextErrors.push(t("lblSelectCakeSizeError"));
    if (selectedType?.flavors?.length > 0 && !selectedFlavor) nextErrors.push(t("lblSelectCakeFlavorError"));
    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const submitQuoteRequest = async (receivingInfo) => {
    if (!validateSelections()) return;
    if (status !== "authenticated") {
      openLoginPopup();
      setErrors([t("lblLoginBeforeQuote")]);
      return;
    }
    if (!receivingInfo) {
      setShowReceivingModal(true);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);
    try {
      const user = session?.user || {};
      const formData = new FormData();
      formData.append("product_id", String(baseProduct.id));
      formData.append("billing", JSON.stringify({
        full_name: user.full_name || "",
        phone: String(user.phone_number || "").replace(/^966/, ""),
      }));
      formData.append("receiving_info", JSON.stringify(receivingInfo));
      formData.append("language", language);
      formData.append("custom_cake", JSON.stringify({
        product_id: baseProduct.id,
        type: optionSnapshot(selectedType),
        size: optionSnapshot(selectedSize),
        flavor: optionSnapshot(selectedFlavor),
        text: cakeText,
        note: cakeNote,
        color_text: colorText,
        border_color: borderColor,
      }));
      if (sketchFile) {
        formData.append("sketch_url", sketchFile);
      }

      const response = await axios.post(
        createCustomCakeQuoteRoute,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken || ""}`,
          },
        },
      );
      router.push(response.data?.data?.redirect_url || "/my-account/orders");
    } catch (error) {
      setErrors([error?.response?.data?.message || t("lblQuoteSubmitError")]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetQuote = async () => {
    if (status !== "authenticated") {
      openLoginPopup();
      return;
    }

    if (!validateSelections()) return;
    const receivingInfo = getSavedReceivingInfo();
    // Ice Cream Cake always reopens the popup so a previously saved slot from
    // another product cannot bypass its same-day eight-hour preparation rule.
    if (!receivingInfo || isIceCreamCake) {
      setShowReceivingModal(true);
      return;
    }
    await submitQuoteRequest(receivingInfo);
  };

  return (
    <section className="customise-cake">
      {/* Banner */}
      <div>
        <img
          src="/assets/images/MB_Design Your Cake_1920 x 450 english.jpg"
          className="w-100"
          alt={t("lblDesignCakeBannerAlt")}
        />
      </div>

      <div className="container">
        {/* Header */}
        <div className="py-4 mb-4 d-flex align-items-center gap-3">
          <a href="/product-category/cakes">
            <img src="/assets/images/brown-arrow.png" alt={t("lblBackToCakes")} />
          </a>
          <h2 className="font-brandon-black text-brown m-0 fs-fluid-50">
            {t("lblCustomiseYourOwnCake")}
          </h2>
        </div>

        <div className="row">
          {/* Left Column - Form */}
          <div className="col-md-8">
            {errors.length > 0 && (
              <div className="alert alert-danger">
                <ul className="mb-0">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step 1: Select cake type */}
            <div>
              <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">1</span>
                {t("lblSelectCakeType")}
              </h4>
              <div className="d-flex gap-2 mt-4 mb-3 flex-wrap">
                {cakeTypes.map((type) => {
                  const typeName = optionName(type, language);
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleSelectType(type)}
                      className={`selectBox py-2 px-1 rounded-3 text-center d-flex flex-column justify-content-between cursor w-160px ${
                        selectedType?.id === type.id ? "active" : ""
                      }`}
                    >
                      <div>
                        {type.image && (
                          <img
                            src={type.image}
                            alt={typeName}
                            className="img-fluid img-max-h-80 object-fit-contain"
                          />
                        )}
                      </div>
                      <div>
                        <h6 className="font-brandon-bold text-brown mt-2 m-0 fs-20">
                          {typeName}
                        </h6>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Size (if applicable) */}
            {selectedType?.sizes?.length > 0 && (
              <div className="mt-5">
                <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                  <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">2</span>
                  {t("lblSelectCakeSize")}
                </h4>
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  {selectedType.sizes.map((size) => {
                    const sizeName = optionName(size, language);
                    return (
                      <div
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`selectBox py-2 px-1 rounded-3 text-center d-flex flex-column justify-content-between cursor w-160px ${
                          selectedSize?.id === size.id ? "active" : ""
                        }`}
                      >
                        <div>
                          {size.image && (
                            <img
                              src={size.image}
                              alt={sizeName}
                              className="img-fluid img-max-h-80 object-fit-contain"
                            />
                          )}
                        </div>
                        <div>
                          <h6 className="font-brandon-bold text-brown mt-2 m-0 fs-20">
                            {sizeName}
                          </h6>
                          {size.portion_size && (
                            <small className="text-muted">{size.portion_size}</small>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Flavor (if applicable) */}
            {selectedType?.flavors?.length > 0 && (
              <div className="mt-5">
                <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                  <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">
                    {selectedType?.sizes?.length > 0 ? 3 : 2}
                  </span>
                  {t("lblSelectCakeFlavor")}
                </h4>
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  {selectedType.flavors.map((flavor) => {
                    const flavorName = optionName(flavor, language);
                    return (
                      <div
                        key={flavor.id}
                        onClick={() => setSelectedFlavor(flavor)}
                        className={`selectBox py-2 px-1 rounded-3 text-center d-flex flex-column justify-content-between cursor w-160px ${
                          selectedFlavor?.id === flavor.id ? "active" : ""
                        }`}
                      >
                        <div>
                          {flavor.image && (
                            <img
                              src={flavor.image}
                              alt={flavorName}
                              className="img-fluid img-max-h-80 object-fit-contain"
                            />
                          )}
                        </div>
                        <div>
                          <h6 className="font-brandon-bold text-brown mt-2 m-0 fs-20">
                            {flavorName}
                          </h6>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sketch Upload */}
            {selectedType && (
              <div className="row my-4">
                <div className="col-md-12 d-flex flex-column mb-4">
                  <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center m-0">
                    <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">
                      {getSketchStep()}
                    </span>
                    {t("lblAddSketchPhotos")}
                  </h4>
                  <p className="ms-4 ps-3 text-pink">{t("lblMaxSize")}</p>
                  <div
                    className="upload-box upload-box-cake mt-3 px-4 me-4 position-relative rounded-5 d-flex flex-column align-items-center justify-content-center"
                  >
                    <input
                      type="file"
                      id="sketch_image"
                      className="d-none"
                      accept=".jpg,.jpeg,.png,.gif"
                      onChange={handleSketchChange}
                    />
                    <label
                      htmlFor="sketch_image"
                      className="btn border border-secondary rounded-5 py-2 px-4 cursor bg-translucent-white"
                    >
                      {t("lblUploadSketchImage")}
                    </label>
                    <p className="text-center mt-2">
                      <span className="bg-white p-2 small">{t("lblAllowedImageTypes")}</span>
                    </p>
                    {sketchFile && (
                      <p className="text-center small color-brown fw-bold mb-0">{sketchFile.name}</p>
                    )}
                  </div>
                </div>

                {/* Add Cake Text */}
                <div className="col-md-12">
                  <div className="addText-form">
                    <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                      <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">
                        {getTextStep()}
                      </span>
                      {t("lblAddCakeText")}
                    </h4>
                    <input
                      type="text"
                      placeholder={t("lblYourTextForCake")}
                      value={cakeText}
                      onChange={(e) => setCakeText(e.target.value)}
                      className="w-100 mb-3"
                    />

                    {isCookieCake && (
                      <>
                        <input
                          type="text"
                          placeholder={t("lblColorOfText")}
                          value={colorText}
                          onChange={(e) => setColorText(e.target.value)}
                          className="w-100 mb-3"
                        />
                        <input
                          type="text"
                          placeholder={t("lblColorOfBorder")}
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="w-100 mb-3"
                        />
                      </>
                    )}

                    <textarea
                      placeholder={t("lblYourAdditionalNote")}
                      rows={4}
                      value={cakeNote}
                      onChange={(e) => setCakeNote(e.target.value)}
                      className="w-100 mb-0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="col-md-4">
            <h4 className="text-brown-50 fs-20">{t("lblSummary")}</h4>
            <div className="bg-light-white p-3 rounded-4">
              <div className="d-flex justify-content-between dashedline">
                <p className="text-brown-50">{t("lblCakeType")}</p>
                <p className="color-brown fw-bold">{selectedType ? optionName(selectedType, language) : ""}</p>
              </div>

              {selectedType?.sizes?.length > 0 && (
                <div className="d-flex justify-content-between dashedline">
                  <p className="text-brown-50">{t("lblSelectSize")}</p>
                  <p className="color-brown fw-bold">{selectedSize ? optionName(selectedSize, language) : ""}</p>
                </div>
              )}

              {selectedType?.flavors?.length > 0 && (
                <div className="d-flex justify-content-between dashedline">
                  <p className="text-brown-50">{t("lblSelectFlavor")}</p>
                  <p className="color-brown fw-bold">{selectedFlavor ? optionName(selectedFlavor, language) : ""}</p>
                </div>
              )}

              <div className="d-flex justify-content-between dashedline">
                <p className="text-brown-50">{t("lblCakeText")}</p>
                <p className="color-brown fw-bold">{cakeText}</p>
              </div>

              {isCookieCake && (
                <>
                  <div className="d-flex justify-content-between dashedline">
                    <p className="text-brown-50">{t("lblColorText")}</p>
                    <p className="color-brown fw-bold">{colorText}</p>
                  </div>
                  <div className="d-flex justify-content-between dashedline">
                    <p className="text-brown-50">{t("lblBorderColor")}</p>
                    <p className="color-brown fw-bold">{borderColor}</p>
                  </div>
                </>
              )}

              <div className="d-flex justify-content-between dashedline">
                <p className="text-brown-50">{t("lblCakeNote")}</p>
                <p className="color-brown fw-bold">{cakeNote}</p>
              </div>

              <button
                type="button"
                className="btn bg-sky text-white w-100 rounded-5 fw-bold fs-5 mt-3"
                onClick={handleGetQuote}
                disabled={isSubmitting}
              >
                {isSubmitting ? t("lblSubmitting") : t("lblGetQuote")}
              </button>
            </div>
          </div>
        </div>
        {showReceivingModal && (
          <DeliveryPickupModal
            branches={branches}
            language={language}
            productId={baseProduct?.id || 38}
            productType="custom_products"
            leadHours={isIceCreamCake ? 8 : undefined}
            onClose={() => setShowReceivingModal(false)}
            onConfirm={async (info) => {
              setShowReceivingModal(false);
              await submitQuoteRequest(info);
            }}
          />
        )}
      </div>
    </section>
  );
}

export default MakeCake;

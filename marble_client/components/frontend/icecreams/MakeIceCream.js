"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { addCartItemRoute } from "@/utils/apiRoutes";
import apiKeyMapping from "@/configs/apiKeyMapping";
import DeliveryPickupModal, { getSavedReceivingInfo } from "@/components/frontend/product/DeliveryPickupModal";
import { notifyCartUpdated } from "@/utils/cartEvents";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";

function getCartUserId() {
  if (typeof window === "undefined") return "guest";
  let userId = window.localStorage.getItem("marble_cart_user_id");
  if (!userId) {
    userId = `guest-${window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now()}`;
    window.localStorage.setItem("marble_cart_user_id", userId);
  }
  document.cookie = `marble_cart_user_id=${encodeURIComponent(userId)}; path=/; max-age=31536000; samesite=lax`;
  return userId;
}

function getApiHeaders() {
  const hostname = typeof window === "undefined" ? "localhost" : window.location.hostname;
  return { "X-API-KEY": apiKeyMapping[hostname] || apiKeyMapping.localhost };
}

function optionName(item, language) {
  return getLocalizedValue(item?.name_en, item?.name_ar, language);
}

function optionItem(item) {
  return {
    id: item.id,
    name_en: item.name_en || "",
    name_ar: item.name_ar || "",
    slug: item.slug,
  };
}

function MakeIceCream({ buckets = [], flavors = [], mixins = [], sauces = [], baseProduct = null, language = "en" }) {
  const router = useRouter();
  const t = (labelKey, fallback) => getLocalizedLabel(labelKey, language, fallback);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedMixins, setSelectedMixins] = useState([]);
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showReceivingModal, setShowReceivingModal] = useState(false);

  const handleSelectBucket = (bucket) => {
    setSelectedBucket(bucket);
    setErrors([]);
  };

  const handleToggleFlavor = (flavor) => {
    if (selectedFlavors.find((f) => f.id === flavor.id)) {
      setSelectedFlavors(selectedFlavors.filter((f) => f.id !== flavor.id));
    } else if (selectedFlavors.length < 2) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    } else {
      setErrors([t("lblSelectUpToTwoFlavorsDetailedError")]);
      return;
    }
    setErrors([]);
  };

  const handleToggleMixin = (mixin) => {
    if (selectedMixins.find((m) => m.id === mixin.id)) {
      setSelectedMixins(selectedMixins.filter((m) => m.id !== mixin.id));
    } else if (selectedMixins.length < 9) {
      setSelectedMixins([...selectedMixins, mixin]);
    } else {
      setErrors([t("lblSelectUpToNineMixinsDetailedError")]);
      return;
    }
    setErrors([]);
  };

  const handleToggleSauce = (sauce) => {
    if (selectedSauces.find((s) => s.id === sauce.id)) {
      setSelectedSauces(selectedSauces.filter((s) => s.id !== sauce.id));
    } else {
      setSelectedSauces([...selectedSauces, sauce]);
    }
    setErrors([]);
  };

  const calculateTotal = () => {
    let total = selectedBucket ? parseFloat(selectedBucket.price) || 0 : 0;
    const extraMixins = Math.max(0, selectedMixins.length - 2);
    total += extraMixins * 4;
    total += selectedSauces.length * 6;
    return total;
  };

  const validateSelections = () => {
    const nextErrors = [];

    if (!baseProduct?.id) nextErrors.push(t("lblCustomIceCreamUnavailable"));
    if (!selectedBucket) nextErrors.push(t("lblSelectBucketSizeError"));
    if (selectedFlavors.length === 0 || selectedFlavors.length > 2) {
      nextErrors.push(t("lblSelectUpToTwoFlavorsError"));
    }
    if (selectedMixins.length === 0 || selectedMixins.length > 9) {
      nextErrors.push(t("lblSelectUpToNineMixinsError"));
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const addIceCreamToCart = async () => {
    if (!validateSelections()) return;

    setIsAddingToCart(true);
    try {
      const response = await axios.post(
        addCartItemRoute,
        {
          user_id: getCartUserId(),
          product_id: baseProduct.id,
          product_type: "custom_icecream",
          quantity: 1,
          icecream_bucket_option: {
            ...optionItem(selectedBucket),
            size: selectedBucket.size,
            price: selectedBucket.price,
            calories: selectedBucket.calories,
          },
          icecream_flavor_items: selectedFlavors.map((item) => optionItem(item)),
          icecream_mixin_items: selectedMixins.map((item) => optionItem(item)),
          icecream_sauce_items: selectedSauces.map((item) => optionItem(item)),
          custom_price: calculateTotal(),
        },
        { headers: getApiHeaders() },
      );
      notifyCartUpdated(response.data);
      router.push("/cart");
    } catch {
      setErrors([t("lblCustomIceCreamAddError")]);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToCart = async () => {
    if (!validateSelections()) return;

    if (!getSavedReceivingInfo()) {
      setShowReceivingModal(true);
      return;
    }

    await addIceCreamToCart();
  };

  return (
    <section className="customise-ice-cream">
      {/* Banner */}
      <div>
        <img
          src="/assets/images/ice-box.jpg"
          className="w-100"
          alt={t("lblIceCreamBucketBannerAlt")}
        />
      </div>

      <div className="container">
        {/* Header */}
        <div className="py-4 mb-4 d-flex align-items-center gap-3">
          <a href="/product-category/icecreams">
            <img src="/assets/images/brown-arrow.png" alt={t("lblBackToIceCreams")} />
          </a>
          <h2 className="font-brandon-black text-brown m-0 fs-fluid-50">
            {t("lblIceCreamBucket")}
          </h2>
        </div>

        <div className="row">
          {/* Left Column - Options */}
          <div className="col-md-8 mb-5">
            {errors.length > 0 && (
              <div className="alert alert-danger">
                <ul className="mb-0">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step 1: Select bucket size */}
            <div>
              <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">1</span>
                {t("lblSelectBucketSize")}
              </h4>
              <div className="d-flex gap-3 mt-3 flex-wrap">
                {buckets.map((bucket) => {
                  const bucketName = optionName(bucket, language);
                  return (
                    <div
                      key={bucket.id}
                      onClick={() => handleSelectBucket(bucket)}
                      className={`selectBox py-2 px-3 rounded-3 text-center d-flex flex-column justify-content-between cursor w-160px ${
                        selectedBucket?.id === bucket.id ? "active" : ""
                      }`}
                    >
                      <div className="pt-15px">
                        {bucket.image && (
                          <img
                            src={bucket.image}
                            alt={bucketName}
                            className="img-fluid img-max-h-80 object-fit-contain"
                          />
                        )}
                      </div>
                      <div>
                        <h6 className="font-brandon-bold text-brown mt-2 m-0 fs-20">
                          {bucketName}
                        </h6>
                        {bucket.calories && (
                          <p className="m-0 text-muted small">{t("lblCalories")} - {bucket.calories}</p>
                        )}
                        <p className="m-0 text-muted small">{bucket.size}</p>
                        <p className="m-0 fw-bold text-muted mt-1 price-pill">
                          SAR {bucket.price}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select up to 2 flavors */}
            <div className="mt-5">
              <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">2</span>
                {t("lblSelectUpToTwoFlavors")}
              </h4>
              <div className="d-flex flex-wrap mt-3 mb-3 gap-20px">
                {flavors.map((flavor) => {
                  const flavorName = optionName(flavor, language);
                  return (
                    <div
                      key={flavor.id}
                      onClick={() => handleToggleFlavor(flavor)}
                      className={`selectFlavor2 py-2 text-center d-flex flex-column justify-content-between cursor w-100px ${
                        selectedFlavors.find((f) => f.id === flavor.id) ? "active" : ""
                      }`}
                    >
                      <div className="falvorimg rounded-circle border border-gray">
                        {flavor.image && (
                          <img
                            src={flavor.image}
                            alt={flavorName}
                            className="w-100 object-fit-contain"
                          />
                        )}
                      </div>
                      <div className="mt-3">
                        <h6 className="font-brandon-bold text-brown m-0 fs-20">
                          {flavorName}
                        </h6>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Choose mix-ins */}
            <div className="mt-5">
              <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">3</span>
                {t("lblChooseMixins")}
              </h4>
              <p className="ms-4 ps-3 text-pink">
                {t("lblFreeMixinsNote")}
              </p>
              {selectedMixins.length > 2 && (
                <p className="ms-4 ps-3 text-danger fw-bold small">
                  {t("lblAdditionalCharge")}: SR.{(selectedMixins.length - 2) * 4}
                </p>
              )}
              <div className="d-flex flex-wrap mt-3 mb-3 gap-20px">
                {mixins.map((mixin) => {
                  const mixinName = optionName(mixin, language);
                  return (
                    <div
                      key={mixin.id}
                      onClick={() => handleToggleMixin(mixin)}
                      className={`selectFlavor2 py-2 text-center d-flex flex-column justify-content-between cursor w-100px ${
                        selectedMixins.find((m) => m.id === mixin.id) ? "active" : ""
                      }`}
                    >
                      <div className="falvorimg rounded-circle border border-gray">
                        {mixin.image && (
                          <img
                            src={mixin.image}
                            alt={mixinName}
                            className="w-100 object-fit-contain"
                          />
                        )}
                      </div>
                      <div className="mt-3">
                        <h6 className="font-brandon-bold text-brown m-0 fs-20">
                          {mixinName}
                        </h6>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Choose special sauces */}
            <div className="mt-5">
              <h4 className="font-brandon-black text-brown fs-24 d-flex align-items-center">
                <span className="selectnum numar me-2 d-block text-center bg-brown-50 text-white rounded-circle">4</span>
                {t("lblChooseSpecialSauces")}
                <span className="badge bg-secondary ms-2 fw-normal fs-12">{t("lblOptional")}</span>
              </h4>
              <p className="ms-4 ps-3 text-pink">{t("lblEachSauce")}</p>
              <div className="d-flex flex-wrap mt-3 mb-3 gap-20px">
                {sauces.map((sauce) => {
                  const sauceName = optionName(sauce, language);
                  return (
                    <div
                      key={sauce.id}
                      onClick={() => handleToggleSauce(sauce)}
                      className={`selectFlavor2 py-2 text-center d-flex flex-column justify-content-between cursor w-100px ${
                        selectedSauces.find((s) => s.id === sauce.id) ? "active" : ""
                      }`}
                    >
                      <div className="falvorimg rounded-circle border border-gray">
                        {sauce.image && (
                          <img
                            src={sauce.image}
                            alt={sauceName}
                            className="w-100 object-fit-contain"
                          />
                        )}
                      </div>
                      <div className="mt-3">
                        <h6 className="font-brandon-bold text-brown m-0 fs-20">
                          {sauceName}
                        </h6>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="col-md-4">
            <h4 className="text-brown-50 fs-20">{t("lblSummary")}</h4>
            <div className="bg-light-white p-3 rounded-4">
              <div className="d-flex justify-content-between dashedline mt-1 mb-4">
                <p className="text-brown-50">{t("lblBucketSize")}</p>
                <p className="color-brown fw-bold">
                  {selectedBucket ? optionName(selectedBucket, language) : ""}
                </p>
              </div>

              <div className="d-flex justify-content-between dashedline mb-4">
                <p className="text-brown-50">{t("lblFlavors")}</p>
                <p className="color-brown fw-bold">
                  {selectedFlavors.map((item) => optionName(item, language)).join(", ")}
                </p>
              </div>

              <div className="d-flex justify-content-between dashedline mb-4">
                <p className="text-brown-50">{t("lblMixins")}</p>
                <p className="color-brown fw-bold">
                  {selectedMixins.map((item) => optionName(item, language)).join(", ")}
                </p>
              </div>

              <div className="d-flex justify-content-between dashedline mb-4">
                <p className="text-brown-50">{t("lblSauces")}</p>
                <p className="color-brown fw-bold">
                  {selectedSauces.map((item) => optionName(item, language)).join(", ")}
                </p>
              </div>

              <div className="d-flex justify-content-between dashedline mb-4">
                <p className="text-brown-50">{t("lblSubtotal")}</p>
                <p className="color-brown fw-bold">{calculateTotal()} SAR</p>
              </div>

              <button
                type="button"
                className="btn add-to-cart-btn w-100 mt-3"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !baseProduct?.id}
              >
                {isAddingToCart ? t("lblAddingToCart") : t("lblAddToCart")}
              </button>
            </div>
          </div>
        </div>
        {showReceivingModal && (
          <DeliveryPickupModal
            branches={baseProduct?.branches || []}
            language={language}
            productId={baseProduct?.id || 432}
            productType="custom_products"
            onClose={() => setShowReceivingModal(false)}
            onConfirm={async () => {
              setShowReceivingModal(false);
              await addIceCreamToCart();
            }}
          />
        )}
      </div>
    </section>
  );
}

export default MakeIceCream;

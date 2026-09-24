"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import getApiKeyByDomain from "@/configs/getApiKey";
import { loadGoogleMapsScript } from "@/utils/googleMaps";
import {
  getCitiesRoute,
  getPickupDeliverySettingsRoute,
  getShippingSettingsRoute,
  getTimeSlotsRoute,
} from "@/utils/apiRoutes";
import { getLocalizedLabel, getLocalizedValue } from "@/utils/localizedContent";
import { getRiyadhDate as today } from "@/utils/riyadhDate";
import {
  calculateDistanceShippingCost,
  parseShippingRules,
} from "@/utils/shipping";
import {
  isDeliveryBranchStatus,
  isPickupBranchStatus,
} from "@/utils/branchStatus";

const DEFAULT_TIME_SLOTS = [
  "12 PM — 2 PM",
  "2 PM — 4 PM",
  "4 PM — 6 PM",
  "6 PM — 8 PM",
  "8 PM — 10 PM",
  "10 PM — 12 AM",
];

function normalizeSlotLabel(slot) {
  return String(slot || "").replace(/[—–]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
}

function findMatchingSlot(slots, selected) {
  if (!selected) return "";
  if (slots.includes(selected)) return selected;
  const needle = normalizeSlotLabel(selected);
  return slots.find((slot) => normalizeSlotLabel(slot) === needle) || "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function isPickupBranch(branch) {
  return isPickupBranchStatus(branch.status);
}

function isDeliveryBranch(branch) {
  return isDeliveryBranchStatus(branch.status);
}

function branchLatLng(branch) {
  const lat = parseFloat(branch.latitude);
  const lng = parseFloat(branch.longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

function branchDisplayName(branch, language) {
  return getLocalizedValue(branch?.name_en, branch?.name_ar, language);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function calculateShippingCost(distance, rules) {
  return calculateDistanceShippingCost(distance, rules);
}

export function getSavedReceivingInfo() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("marble_receiving_info");
  if (!raw) return null;

  try {
    const info = JSON.parse(raw);
    const required = ["address_type", "selected_time_slot", "selected_date", "nearest_branch", "branch_city", "address"];
    return required.every((field) => info[field]) ? info : null;
  } catch {
    return null;
  }
}

export function persistReceivingInfo(info) {
  window.localStorage.setItem("marble_receiving_info", JSON.stringify(info));
  document.cookie = `marble_receiving_info=${encodeURIComponent(JSON.stringify(info))}; path=/; max-age=31536000; samesite=lax`;
}

export default function DeliveryPickupModal({
  branches = [],
  onClose,
  onConfirm,
  initialReceivingInfo,
  language = "en",
  productId,
  productType,
  leadHours,
  pickupOnly = false,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const branchMarkersRef = useRef([]);
  const searchInputRef = useRef(null);
  const savedReceivingInfo = useMemo(
    () => initialReceivingInfo || getSavedReceivingInfo() || {},
    [initialReceivingInfo],
  );
  const [addressType, setAddressType] = useState(savedReceivingInfo.address_type || "Delivery");
  const [selectedDate, setSelectedDate] = useState(savedReceivingInfo.selected_date || today());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(savedReceivingInfo.selected_time_slot || "");
  const [branchCity, setBranchCity] = useState(savedReceivingInfo.branch_city || "");
  const [nearestBranch, setNearestBranch] = useState(savedReceivingInfo.nearest_branch || "");
  const [address, setAddress] = useState(savedReceivingInfo.address || "");
  const [shippingCost, setShippingCost] = useState(Number(savedReceivingInfo.shipping_cost || 0));
  const [shippingDistance, setShippingDistance] = useState(Number(savedReceivingInfo.shipping_distance || 0));
  const [sendForSomeone, setSendForSomeone] = useState(Boolean(savedReceivingInfo.is_send_for_someone_checked));
  const [recipientName, setRecipientName] = useState(savedReceivingInfo.recipient_name || "");
  const [recipientPhone, setRecipientPhone] = useState(savedReceivingInfo.recipient_phone || "");
  const [addressAvailability, setAddressAvailability] = useState(savedReceivingInfo.address_availability || "yes");
  const [errors, setErrors] = useState([]);
  const [mapError, setMapError] = useState("");
  const [pickupDeliverySettings, setPickupDeliverySettings] = useState({
    delivery_enabled: true,
    pickup_enabled: true,
  });
  const [shippingRules, setShippingRules] = useState(null);
  const [shippingSettingsError, setShippingSettingsError] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [filteredBranches, setFilteredBranches] = useState(null);
  const [timeSlots, setTimeSlots] = useState(DEFAULT_TIME_SLOTS);
  const [dateRange, setDateRange] = useState({ min: today(), max: "" });
  const [dateLocked, setDateLocked] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(true);
  const t = useCallback(
    (labelKey, fallback) =>
      getLocalizedLabel(labelKey, language, fallback),
    [language],
  );

  const showBranchSelector = addressType === "Pickup" || (addressType === "Delivery" && sendForSomeone && addressAvailability === "no");
  const deliveryEnabled =
    pickupDeliverySettings.delivery_enabled && !pickupOnly;
  const pickupEnabled = pickupDeliverySettings.pickup_enabled;

  useEffect(() => {
    let cancelled = false;
    let pending = 2;
    const done = () => {
      pending -= 1;
      if (!cancelled && pending <= 0) setSettingsLoading(false);
    };

    fetch(getPickupDeliverySettingsRoute, {
      headers: { "X-API-KEY": getApiKeyByDomain() },
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) throw new Error("pickup/delivery settings request failed");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPickupDeliverySettings({
            delivery_enabled: data.delivery_enabled !== false,
            pickup_enabled: data.pickup_enabled !== false,
          });
        }
      })
      .catch(() => {
        // Preserve both options when settings cannot be loaded.
      })
      .finally(done);

    fetch(getShippingSettingsRoute, {
      headers: { "X-API-KEY": getApiKeyByDomain() },
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) throw new Error("shipping settings request failed");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const rules = parseShippingRules(data);
        if (!rules) throw new Error("shipping settings incomplete");
        setShippingRules(rules);
        setShippingSettingsError(false);
      })
      .catch(() => {
        if (!cancelled) {
          setShippingRules(null);
          setShippingSettingsError(true);
        }
      })
      .finally(done);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (settingsLoading) return;
    const currentEnabled =
      (addressType === "Delivery" && deliveryEnabled) ||
      (addressType === "Pickup" && pickupEnabled);
    if (currentEnabled) return;

    const nextType = deliveryEnabled
      ? "Delivery"
      : pickupEnabled
        ? "Pickup"
        : "";
    setAddressType(nextType);
    setBranchCity("");
    setNearestBranch("");
    setSelectedTimeSlot("");
    setAddress("");
    setShippingCost(0);
    setShippingDistance(0);
  }, [
    addressType,
    deliveryEnabled,
    pickupEnabled,
    settingsLoading,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadFilteredBranches() {
      try {
        const params = new URLSearchParams({
          lang: language === "ar" ? "ar" : "en",
          addressType,
        });
        if (productId) params.set("product_id", String(productId));
        if (productType) params.set("product_type", String(productType));

        const response = await fetch(`${getCitiesRoute}?${params.toString()}`, {
          headers: { "X-API-KEY": getApiKeyByDomain() },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("cities request failed");

        const json = await response.json();
        if (cancelled) return;
        const nextBranches = (json.cities || []).flatMap((city) => {
          const cityName = city.name_en || city.name || "";
          return (city.branches || []).map((branch) => ({
            ...branch,
            city: cityName,
            city_id: branch.city_id || city.id,
          }));
        });
        setFilteredBranches(nextBranches);
      } catch {
        // Keep the page-provided branches as a temporary network fallback.
        if (!cancelled) setFilteredBranches(null);
      }
    }

    loadFilteredBranches();
    return () => {
      cancelled = true;
    };
  }, [addressType, language, productId, productType]);

  const branchPool = filteredBranches ?? branches;
  const availableBranches = useMemo(() => {
    const filterFn = addressType === "Pickup" ? isPickupBranch : isDeliveryBranch;
    return branchPool.filter((branch) => filterFn(branch));
  }, [addressType, branchPool]);

  useEffect(() => {
    if (filteredBranches === null || !nearestBranch) return;
    const isStillAvailable = availableBranches.some(
      (branch) => branch.name_en === nearestBranch,
    );
    if (isStillAvailable) return;

    setNearestBranch("");
    setBranchCity("");
    setSelectedTimeSlot("");
    setShippingCost(0);
    setShippingDistance(0);
    if (addressType === "Pickup" || addressAvailability === "no") {
      setAddress("");
    }
  }, [
    addressAvailability,
    addressType,
    availableBranches,
    filteredBranches,
    nearestBranch,
  ]);

  const cities = useMemo(
    () => unique(availableBranches.map((branch) => branch.city)),
    [availableBranches],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTimeSlots() {
      setSlotsLoading(true);
      setSlotsMessage("");
      if (!addressType) {
        setTimeSlots([]);
        setSlotsLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          date: selectedDate || today(),
          lang: language === "ar" ? "ar" : "en",
          addressType,
        });
        if (nearestBranch) params.set("branch", nearestBranch);
        if (productId) params.set("product_id", String(productId));
        if (productType) params.set("product_type", String(productType));
        if (leadHours) params.set("lead_hours", String(leadHours));

        const selected = availableBranches.find((branch) => branch.name_en === nearestBranch);
        if (selected?.id) params.set("branch_id", String(selected.id));

        const res = await fetch(`${getTimeSlotsRoute}?${params.toString()}`, {
          headers: { "X-API-KEY": getApiKeyByDomain() },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("time-slots request failed");

        const json = await res.json();
        if (cancelled) return;

        const slots = Array.isArray(json.available_slots) ? json.available_slots : [];
        const range = json.date_range || {};
        const nextMin = range.min || today();
        const nextMax = range.max || "";
        const lockedDate = json.locked_date || "";
        const isDateLocked = Boolean(json.date_locked && lockedDate);

        setTimeSlots(slots);
        setDateRange({ min: nextMin, max: nextMax });
        setDateLocked(isDateLocked);
        setSlotsMessage(
          json.message ||
            (slots.length ? "" : t("lblNoTimeSlots", "No time slots available for the selected date.")),
        );

        if (lockedDate && selectedDate !== lockedDate) {
          setSelectedDate(lockedDate);
          setSelectedTimeSlot("");
          return;
        }

        if (nextMin && selectedDate && selectedDate < nextMin) {
          setSelectedDate(nextMin);
          setSelectedTimeSlot("");
          return;
        }
        if (nextMax && selectedDate && selectedDate > nextMax) {
          setSelectedDate(nextMax);
          setSelectedTimeSlot("");
          return;
        }

        setSelectedTimeSlot((current) => findMatchingSlot(slots, current));
      } catch {
        if (cancelled) return;
        setTimeSlots([]);
        setSelectedTimeSlot("");
        setDateRange({ min: today(), max: "" });
        setDateLocked(false);
        setSlotsMessage(
          t(
            "lblTimeSlotsLoadError",
            "Time slots could not be loaded. Please try again.",
          ),
        );
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    loadTimeSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, nearestBranch, addressType, language, productId, productType, leadHours, availableBranches, t]);

  const cityBranches = useMemo(() => (
    branchCity
      ? availableBranches.filter((branch) => branch.city === branchCity)
      : availableBranches
  ), [availableBranches, branchCity]);

  const selectedBranch = cityBranches.find((branch) => branch.name_en === nearestBranch);

  const resetBranchSelection = (nextType = addressType) => {
    setBranchCity("");
    setNearestBranch("");
    setShippingCost(0);
    setShippingDistance(0);
    setMapError("");
    if (nextType === "Pickup" || addressAvailability === "no") setAddress("");
  };

  const clearBranchMarkers = () => {
    branchMarkersRef.current.forEach((marker) => marker.setMap(null));
    branchMarkersRef.current = [];
  };

  const findNearestDeliveryBranch = (point) => {
    const deliveryBranches = branchPool.filter(isDeliveryBranch);
    let nearest = null;
    let nearestDistance = Infinity;

    deliveryBranches.forEach((branch) => {
      const coords = branchLatLng(branch);
      if (!coords) return;

      const distance = calculateDistance(point.lat, point.lng, coords.lat, coords.lng);
      if (distance < nearestDistance) {
        nearest = branch;
        nearestDistance = distance;
      }
    });

    if (!nearest || !shippingRules) return;

    setNearestBranch(nearest.name_en);
    setBranchCity(nearest.city || "");
    setShippingDistance(Number(nearestDistance.toFixed(2)));
    setShippingCost(calculateShippingCost(nearestDistance, shippingRules) || 0);
    setMapError(
      nearestDistance > shippingRules.max_delivery_distance_km
        ? t("lblServiceUnavailableAddress")
        : "",
    );
  };

  const reverseGeocode = (location) => {
    if (!window.google?.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setAddress(results[0].formatted_address);
        const city = results[0].address_components.find((component) =>
          component.types.includes("locality"),
        )?.long_name;
        if (city) setBranchCity(city);
      }
    });
  };

  const setDeliveryLocation = (location) => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    if (deliveryMarkerRef.current) {
      deliveryMarkerRef.current.setMap(null);
    }

    deliveryMarkerRef.current = new window.google.maps.Marker({
      map,
      position: location,
      draggable: true,
    });

    deliveryMarkerRef.current.addListener("dragend", () => {
      const position = deliveryMarkerRef.current.getPosition();
      if (!position) return;
      const point = { lat: position.lat(), lng: position.lng() };
      reverseGeocode(point);
      findNearestDeliveryBranch(point);
      map.panTo(point);
    });

    map.panTo(location);
    reverseGeocode(location);
    findNearestDeliveryBranch(location);
  };

  const initDeliveryMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    clearBranchMarkers();
    setMapError("");
    const fallback = { lat: 23.8859, lng: 45.0792 };
    const map = new window.google.maps.Map(mapRef.current, {
      center: fallback,
      zoom: 6,
      mapTypeId: "roadmap",
    });
    mapInstanceRef.current = map;

    if (searchInputRef.current) {
      const searchBox = new window.google.maps.places.SearchBox(searchInputRef.current);
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        const place = places?.[0];
        if (!place?.geometry?.location) return;
        const point = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        setAddress(place.formatted_address || searchInputRef.current.value);
        setDeliveryLocation(point);
        map.setZoom(15);
      });
    }

    map.addListener("click", (event) => {
      const point = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      setDeliveryLocation(point);
      map.setZoom(15);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = { lat: position.coords.latitude, lng: position.coords.longitude };
          setDeliveryLocation(point);
          map.setZoom(15);
        },
        () => {
          setMapError(t("lblLocationAccessError"));
        },
      );
    }
  };

  const selectBranch = (branch) => {
    setBranchCity(branch.city || "");
    setNearestBranch(branch.name_en);
    setAddress(branch.address || "");
    setShippingCost(0);
    setShippingDistance(0);

    const coords = branchLatLng(branch);
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(coords);
      mapInstanceRef.current.setZoom(14);
    }
  };

  const initPickupMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    setMapError("");
    if (deliveryMarkerRef.current) {
      deliveryMarkerRef.current.setMap(null);
      deliveryMarkerRef.current = null;
    }
    clearBranchMarkers();

    const firstBranchWithCoords = availableBranches.find((branch) => branchLatLng(branch));
    const center = firstBranchWithCoords ? branchLatLng(firstBranchWithCoords) : { lat: 23.8859, lng: 45.0792 };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: firstBranchWithCoords ? 11 : 6,
      mapTypeId: "roadmap",
    });
    mapInstanceRef.current = map;

    availableBranches.forEach((branch) => {
      const coords = branchLatLng(branch);
      if (!coords) return;

      const marker = new window.google.maps.Marker({
        map,
        position: coords,
        title: branch.name_en,
      });

      marker.addListener("click", () => selectBranch(branch));
      branchMarkersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!addressType) return undefined;
    let cancelled = false;
    const shouldShowPickupMap = addressType === "Pickup" || (addressType === "Delivery" && sendForSomeone && addressAvailability === "no");

    loadGoogleMapsScript(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled) return;
        if (shouldShowPickupMap) {
          initPickupMap();
        } else {
          initDeliveryMap();
        }
      })
      .catch(() => {
        setMapError(t("lblMapLoadError"));
      });

    return () => {
      cancelled = true;
    };
    // Map initialization should run when the visible mode/branch set changes, not when helper identities change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressType, sendForSomeone, addressAvailability, availableBranches]);

  useEffect(() => {
    if (!selectedBranch || !mapInstanceRef.current) return;
    const coords = branchLatLng(selectedBranch);
    if (!coords) return;
    mapInstanceRef.current.panTo(coords);
    mapInstanceRef.current.setZoom(14);
  }, [selectedBranch]);

  const validate = () => {
    const nextErrors = [];

    if (!addressType) {
      nextErrors.push(
        t(
          "lblReceivingUnavailable",
          "Pickup and delivery are currently unavailable.",
        ),
      );
    }
    if (!selectedDate) nextErrors.push(t("lblDateRequired"));
    if (!selectedTimeSlot) nextErrors.push(t("lblTimeSlotRequired"));

    if (addressType === "Delivery") {
      if (!shippingRules) {
        nextErrors.push(
          t(
            "lblUnableLoadShippingSettings",
            "Unable to load delivery fee settings. Please try again.",
          ),
        );
      }

      if (sendForSomeone) {
        if (!recipientName) nextErrors.push(t("lblRecipientNameRequired"));
        if (!/^9665\d{8}$/.test(recipientPhone)) {
          nextErrors.push(t("lblRecipientPhoneInvalid"));
        }
        if (!addressAvailability) nextErrors.push(t("lblAddressAvailabilityRequired"));
      }

      if (!sendForSomeone || addressAvailability === "yes") {
        if (!address) nextErrors.push(t("lblDeliveryAddressRequired"));
        if (!nearestBranch) nextErrors.push(t("lblBranchNotSelected"));
        if (mapError) nextErrors.push(mapError);
      } else {
        if (!branchCity) nextErrors.push(t("lblBranchCityRequired"));
        if (!nearestBranch) nextErrors.push(t("lblBranchNotSelected"));
        if (!address) nextErrors.push(t("lblPickupBranchStoreRequired"));
      }
    }

    if (addressType === "Pickup") {
      if (!branchCity) nextErrors.push(t("lblBranchCityRequired"));
      if (!nearestBranch) nextErrors.push(t("lblBranchNotSelected"));
      if (!address) nextErrors.push(t("lblPickupBranchStoreRequired"));
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const handleBranchChange = (branchName) => {
    const branch = cityBranches.find((item) => item.name_en === branchName);
    if (branch) selectBranch(branch);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (addressType === "Delivery" && !shippingRules) return;

    const resolvedShippingCost = addressType === "Delivery"
      ? (
        sendForSomeone && addressAvailability === "no"
          ? shippingRules.no_address_shipping_cost
          : shippingCost
      )
      : 0;
    const resolvedShippingDistance = addressType === "Delivery" ? shippingDistance : 0;

    const info = {
      address,
      branch_id: selectedBranch?.id || null,
      nearest_branch: nearestBranch,
      shipping_cost: resolvedShippingCost,
      shipping_distance: resolvedShippingDistance,
      address_type: addressType,
      selected_time_slot: selectedTimeSlot,
      selected_date: selectedDate,
      branch_city: branchCity,
      recipient_name: sendForSomeone ? recipientName : "",
      recipient_phone: sendForSomeone ? recipientPhone : "",
      is_send_for_someone_checked: sendForSomeone,
      address_availability: sendForSomeone ? addressAvailability : "yes",
    };

    persistReceivingInfo(info);
    onConfirm(info);
  };

  return (
    <div className="modal d-block delivery-modal" tabIndex={-1}>
      <div className="modal-dialog modal-lg deliveryModel delivery-dialog rounded mt-5">
        <div className="modal-content">
          <div className="modal-header">
            <div id="popup-error">
              {errors.length > 0 && (
                <div className="alert alert-danger py-2 mb-0">
                  {errors.map((error) => (
                    <div key={error}>{error}</div>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="btn-close" aria-label={t("lblClose")} onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row p-1 justify-content-between">
              <div className="col-md-5 p-sm-3 px-0">
                <div className="fs-20 mb-3 fw-bold">{t("lblSelectReceivingType")}</div>
                <div className="d-flex mb-3 p-0 justify-content-center delivery-button">
                  {["Delivery", "Pickup"].map((type) => {
                    const enabled =
                      type === "Delivery"
                        ? deliveryEnabled
                        : pickupEnabled;
                    return (
                      <button
                        key={type}
                        type="button"
                        disabled={settingsLoading || !enabled}
                        onClick={() => {
                          setAddressType(type);
                          setSelectedTimeSlot("");
                          resetBranchSelection(type);
                        }}
                        className={`nav-link py-2 fs-16 fw-bold d-flex justify-content-center gap-1 tab-button ${addressType === type ? "active" : ""}`}
                      >
                        {type === "Pickup" ? t("lblPickup") : t("lblDelivery")}
                      </button>
                    );
                  })}
                </div>

                {pickupOnly && pickupEnabled && (
                  <div className="alert alert-info py-2">
                    {t(
                      "lblPickupOnlyProduct",
                      "This item is available for pickup only.",
                    )}
                  </div>
                )}

                {!settingsLoading &&
                  !deliveryEnabled &&
                  !pickupEnabled && (
                    <div className="alert alert-warning py-2">
                      {t(
                        "lblReceivingUnavailable",
                        "Pickup and delivery are currently unavailable.",
                      )}
                    </div>
                  )}

                {addressType === "Delivery" && (
                  <>
                    <div className="form-check form-switch mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="toggle_send_for_some_one"
                        checked={sendForSomeone}
                        onChange={(event) => setSendForSomeone(event.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="toggle_send_for_some_one">
                        {t("lblSendForSomeone")}
                      </label>
                    </div>

                    {sendForSomeone && (
                      <div className="mt-3">
                        <input
                          type="text"
                          className="form-control drpbtn fs-20 bg-white mb-3"
                          placeholder={t("lblRecipientName")}
                          value={recipientName}
                          onChange={(event) => setRecipientName(event.target.value)}
                        />
                        <input
                          type="text"
                          className="form-control drpbtn fs-20 bg-white mb-3"
                          placeholder={t("lblRecipientPhone")}
                          value={recipientPhone}
                          onChange={(event) => setRecipientPhone(event.target.value.replace(/[^0-9]/g, ""))}
                        />
                        <div className="address-option mt-3 d-flex gap-4">
                          <label className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="addressAvailability"
                              value="yes"
                              checked={addressAvailability === "yes"}
                              onChange={() => {
                                setAddressAvailability("yes");
                                resetBranchSelection("Delivery");
                              }}
                            />
                            <span className="form-check-label">{t("lblIHaveAddress")}</span>
                          </label>
                          <label className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="addressAvailability"
                              value="no"
                              checked={addressAvailability === "no"}
                              onChange={() => {
                                setAddressAvailability("no");
                                setBranchCity("");
                                setNearestBranch("");
                                setAddress("");
                              }}
                            />
                            <span className="form-check-label">{t("lblIDontHaveAddress")}</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {(!sendForSomeone || addressAvailability === "yes") && (
                      <div className="mb-3 form-floating addresinput position-relative bg-white mt-3">
                        <input
                          ref={searchInputRef}
                          type="text"
                          className="form-control"
                          id="pac-input"
                          placeholder={t("lblSearchAddress")}
                          value={address}
                          onChange={(event) => setAddress(event.target.value)}
                        />
                        <label className="fs-20 addinp" htmlFor="pac-input">{t("lblAddressLine")}</label>
                      </div>
                    )}
                  </>
                )}

                {showBranchSelector && (
                  <div className="branch_stores">
                    <div className="fs-20 mb-3 fw-bold">{t("lblCity")}</div>
                    <select
                      className="form-select drpbtn fs-20 bg-white mb-3"
                      value={branchCity}
                      onChange={(event) => {
                        setBranchCity(event.target.value);
                        setNearestBranch("");
                        setAddress("");
                      }}
                    >
                      <option value="">{t("lblSelectCity")}</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>

                    <div className="fs-20 mb-2 fw-bold text-black">{t("lblChooseStore")}</div>
                    <select
                      className="form-select drpbtn fs-20 bg-white mb-3"
                      value={nearestBranch}
                      onChange={(event) => handleBranchChange(event.target.value)}
                      disabled={!branchCity}
                    >
                      <option value="">{t("lblSelectStore")}</option>
                      {cityBranches.map((branch) => (
                        <option key={branch.id} value={branch.name_en}>
                          {branchDisplayName(branch, language)}
                        </option>
                      ))}
                    </select>

                    {selectedBranch && (
                      <p className="text-muted small">{selectedBranch.address}</p>
                    )}
                  </div>
                )}

                <div className="fs-20 mb-2 fw-bold">{t("lblChooseDateTimeSlot")}</div>
                <input
                  type="date"
                  className="form-control drpbtn fs-20 calender mb-3"
                  min={dateRange.min || today()}
                  max={dateRange.max || undefined}
                  value={selectedDate}
                  disabled={dateLocked}
                  onChange={(event) => {
                    if (dateLocked) return;
                    setSelectedDate(event.target.value);
                    setSelectedTimeSlot("");
                  }}
                />
                {dateLocked && (
                  <p className="text-muted small mb-3">
                    {t(
                      "lblSpecialDayDateLocked",
                      "This product can only be received on the selected special day.",
                    )}
                  </p>
                )}
                <select
                  className="form-select drpbtn fs-20 bg-white mb-3"
                  value={selectedTimeSlot}
                  onChange={(event) => setSelectedTimeSlot(event.target.value)}
                  disabled={slotsLoading || timeSlots.length === 0}
                >
                  <option value="">{slotsLoading ? t("lblLoading", "Loading…") : t("lblSelectTime")}</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {slotsMessage && !slotsLoading && (
                  <p className="text-danger small mb-3">{slotsMessage}</p>
                )}

                {shippingSettingsError && addressType === "Delivery" && (
                  <p className="text-danger small mb-3">
                    {t(
                      "lblUnableLoadShippingSettings",
                      "Unable to load delivery fee settings. Please try again.",
                    )}
                  </p>
                )}

                <button
                  type="button"
                  className="fw-bold bg-brand-pink-dark border-0 text-white fs-20 w-100 rounded-5 py-2 mt-2"
                  onClick={handleSubmit}
                  disabled={
                    settingsLoading ||
                    slotsLoading ||
                    !addressType ||
                    (addressType === "Delivery" && !shippingRules)
                  }
                >
                  {settingsLoading || slotsLoading
                    ? t("lblLoading", "Loading…")
                    : t("lblSaveSettings")}
                </button>
              </div>

              <div className="col-md-7 ps-md-4 tabcontent position-relative">
                {mapError && (
                  <div id="service-detail" className="alert alert-danger py-2 mb-2">
                    {mapError}
                  </div>
                )}
                <div ref={mapRef} id="map" className="map-canvas" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

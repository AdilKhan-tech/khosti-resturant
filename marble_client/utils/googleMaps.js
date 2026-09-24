let googleMapsLoaded = false;
let googleMapsLoadPromise;

export const loadGoogleMapsScript = (apiKey) => {
  if (!googleMapsLoaded) {
    googleMapsLoadPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => {
        googleMapsLoaded = true;
        resolve();
      };
    });
  }
  return googleMapsLoadPromise;
};

export const initializeMap = (mapContainerRef, formData, setFormData, mapId) => {
  if (!mapContainerRef.current) {
    console.error("Map container ref is not available yet.");
    return null;
  }

  const { latitude, longitude } = formData;
  const initialLat = parseFloat(latitude) || 0;
  const initialLng = parseFloat(longitude) || 0;

  const map = new google.maps.Map(mapContainerRef.current, {
    center: { lat: initialLat, lng: initialLng },
    zoom: 10,
    mapId: mapId,
  });

  const marker = new google.maps.Marker({
    position: { lat: initialLat, lng: initialLng },
    map: map,
    title: formData.address || "Selected Location",
    draggable: true,
  });

  marker.addListener("dragend", () => {
    const position = marker.getPosition();
    if (position) {
      setFormData((prevData) => ({
        ...prevData,
        latitude: position.lat(),
        longitude: position.lng(),
      }));
    }
  });

  return { map, marker };
};

export const cleanupGoogleMaps = (mapRef, markerRef, mapInitialized) => {
  if (markerRef.current) {
    markerRef.current.setMap(null);
    markerRef.current = null;
  }
  if (mapRef.current) {
    mapRef.current.innerHTML = "";
  }
  mapInitialized.current = false;
};

export const geocodeAddress = async (address) => {
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else if (status === "ZERO_RESULTS") {
        console.warn("No results found for the provided address.");
        resolve(null); // Return null instead of rejecting
      } else {
        reject(new Error("Geocode was not successful: " + status));
      }
    });
  });
};

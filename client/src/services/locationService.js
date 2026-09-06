export const detectUserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: "unsupported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const latitude = coords.latitude;
        const longitude = coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const data = await response.json();
          const address = data.address || {};
          console.log('Nominatim address response:', address);

          resolve({
            latitude,
            longitude,
            city:
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.suburb ||
            address.locality ||
            address.hamlet ||
            '',
            district: address.state_district || address.county || "",
            state: address.state || "",
            country: address.country || "",
            display_name: data.display_name || "",
            status: "detected",
          });
        } catch (error) {
          // GPS still succeeded, so return coordinates even if location lookup fails
          resolve({
            latitude,
            longitude,
            city: "",
            district: "",
            state: "",
            country: "",
            display_name: "",
            status: "detected",
          });
        }
      },
      (error) => {
        const codes = {
          1: "denied",
          2: "unavailable",
          3: "timeout",
        };

        reject({
          code: codes[error.code] || "unavailable",
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });

export const formatCoordinates = (value) =>
  typeof value === "number" ? value.toFixed(6) : "-";
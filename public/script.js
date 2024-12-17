let map;
let marker; 
let infoWindow;
let geocoder;

async function initMap() {
    const position = { lat: 13.6827, lng: -89.2367 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: position,
        mapId: "b6dbba13e9f9df48",
    });

    geocoder = new google.maps.Geocoder();
    infoWindow = new google.maps.InfoWindow();

    fetchSavedLocations();

    map.addListener("click", (event) => {
        placeMarkerAndPanTo(event.latLng, map);
    });
}

async function fetchSavedLocations() {
    try {
        const response = await fetch('/locations'); 
        const savedPlaces = await response.json();

        savedPlaces.forEach(place => {
            new google.maps.Marker({
                position: { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) },
                map: map,
                title: place.name,
                icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            });
        });
    } catch (error) {
        console.error("Error fetching saved locations:", error);
    }
}


function placeMarkerAndPanTo(latLng, map) {
    console.log('Placing marker at:', latLng);

    if (marker) {
        marker.map = null;
    }

    marker = new google.maps.marker.AdvancedMarkerElement({
        position: latLng,
        map: map,
        title: "Selected Location",
        content: createMarkerContent(latLng), 
    });

    map.panTo(latLng);

    document.getElementById("latitude").value = latLng.lat().toFixed(6);
    document.getElementById("longitude").value = latLng.lng().toFixed(6);

    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results[0]) {
            console.log("Geocoder results:", results);

            const formattedAddress = results[0].formatted_address;
            document.getElementById("address").value = formattedAddress;

            const addressComponents = results[0].address_components;
            const street = getAddressComponent(addressComponents, "route");
            const city = getAddressComponent(addressComponents, "locality") ||
                         getAddressComponent(addressComponents, "administrative_area_level_2");
            const country = getAddressComponent(addressComponents, "country");

            const infoContent = `
                <div>
                    <strong>Street:</strong> ${street || "N/A"}<br>
                    <strong>City:</strong> ${city || "N/A"}<br>
                    <strong>Country:</strong> ${country || "N/A"}<br>
                    <strong>Lat:</strong> ${latLng.lat().toFixed(6)}<br>
                    <strong>Long:</strong> ${latLng.lng().toFixed(6)}<br>
                    <strong>Full Address:</strong> ${formattedAddress}
                </div>
            `;

            infoWindow.setContent(infoContent);
            infoWindow.open(map, marker);
        } else {
            console.error("Geocoder failed:", status);
            fallbackDisplay(latLng);
        }
    });
}

function createMarkerContent(latLng) {
    const div = document.createElement("div");
    div.style.backgroundColor = "#1e66f5";
    div.style.color = "#ffffff";
    div.style.padding = "6px";
    div.style.borderRadius = "6px";
    div.style.fontSize = "12px";
    div.innerText = `Lat: ${latLng.lat().toFixed(4)}\nLng: ${latLng.lng().toFixed(4)}`;
    return div;
}

function getAddressComponent(components, type) {
    const component = components.find(c => c.types.includes(type));
    return component ? component.long_name : null;
}

function fallbackDisplay(latLng) {
    const fallbackContent = `
        <div>
            <strong>Lat:</strong> ${latLng.lat().toFixed(6)}<br>
            <strong>Long:</strong> ${latLng.lng().toFixed(6)}<br>
            <em>Address unavailable</em>
        </div>
    `;
    document.getElementById("address").value = `Lat: ${latLng.lat().toFixed(6)}, Long: ${latLng.lng().toFixed(6)}`;
    infoWindow.setContent(fallbackContent);
    infoWindow.open(map, marker);
}

document.addEventListener("DOMContentLoaded", () => {
    initMap();
});

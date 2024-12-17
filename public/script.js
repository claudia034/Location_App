let map;
let marker; 
let infoWindow;
let geocoder;

//Esta función fue creada para definir las coordenadas de inicialización del mapa
async function initMap() {
    const position = { lat: 13.6827, lng: -89.2367 };
     //Acá definimos el ID del mapa que estamos utilizando, el zoom con el que queremos que aparezca y el centrado
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: position,
        mapId: "b6dbba13e9f9df48",
    });
    //Inicializamos el geocodificador y la ventana de información de la información
    geocoder = new google.maps.Geocoder();
    infoWindow = new google.maps.InfoWindow();
    //Muestra las ubicaciones guardadas
    fetchSavedLocations();

    //Crea un marcador en el mapa
    map.addListener("click", (event) => {
        placeMarkerAndPanTo(event.latLng, map);
    });
}

    //Definimos la función de manera asincrona
async function fetchSavedLocations() { 
    try {
        const response = await fetch('/locations'); //Recupera las ubicaciones guardadas
        const savedPlaces = await response.json(); //Analiza la respuesta del JSON 
        
        //Guardamos con el marcador las ubicaciones que seleccionemos
        savedPlaces.forEach(place => {
            new google.maps.Marker({
                position: { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) },
                map: map,
                title: place.name,
                icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            });
        });
    } catch (error) { //Agregamos un mensaje en el caso de que no se puedan guardar las ubicaciones
        console.error("Error fetching saved locations:", error);
    }
}

//Función para colocar un marcador en el mapa
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

    map.panTo(latLng); //Lo utilizo para centrar el mapa en la ubicación del nuevo marcador
    //Establece los valores de longitud y latitud
    document.getElementById("latitude").value = latLng.lat().toFixed(6);
    document.getElementById("longitude").value = latLng.lng().toFixed(6);

    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results[0]) { //analiza el estado del geocodificador
            console.log("Geocoder results:", results);

            const formattedAddress = results[0].formatted_address;
            document.getElementById("address").value = formattedAddress; //Lo utilizo para darle formato a la información de la ubicación

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
//Establecemos lo que va a contener el marcador
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
//Inicializa el mapa cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    initMap();
});
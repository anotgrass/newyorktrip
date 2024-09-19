mapboxgl.accessToken = 'pk.eyJ1IjoiYW5vdGdyYXNzIiwiYSI6ImNtMTdjbGg4eTBzcm0yd3B4d3JpZHl4ejIifQ.h3LZQlV7dGoQ-qKNPCLjTA';

// Define the default zoom level
const defaultCenter = [-74.0060, 40.7128]; // New York City coordinates
const defaultZoom = 12;
const defaultPitch = 60;
const defaultBearing = -17.6;

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: defaultCenter,
    zoom: defaultZoom,
    pitch: defaultPitch,
    bearing: defaultBearing
});

// Custom control for resetting the map to default view
class ResetViewControl {
    onAdd(map) {
        this.map = map;

        // Create a container for the reset button
        this.container = document.createElement('div');
        this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

        // Create the reset button
        const button = document.createElement('button');
        button.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-reset';
        button.type = 'button';
        button.title = 'Reset view';

        // Add the Font Awesome icon to the button
        button.innerHTML = '<i class="fas fa-undo-alt"></i>';

        // Reset the map to its default center and zoom when clicked
        button.onclick = () => {
            this.map.flyTo({
                center: defaultCenter,
                zoom: defaultZoom,
                pitch: defaultPitch,
                bearing: defaultBearing,
                essential: true // Ensure the animation is smooth
            });
        };

        // Append the button to the container
        this.container.appendChild(button);

        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}

// Add the Geocoder control to the map at the top-right
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    }),
    'top-right'
);
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(new ResetViewControl(), 'top-right');
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    }),
    'top-right'
);

// Add markers and numbered markers for each day
Object.keys(locations).forEach(day => {
    locations[day].forEach((location, index) => {
        // Create a custom element for the numbered marker
        const markerEl = document.createElement('div');
        markerEl.className = 'numbered-marker';
        markerEl.textContent = index + 1; // Number the markers for each day

        // Create the marker and add it to the map
        new mapboxgl.Marker(markerEl)
            .setLngLat(location.coords)
            .setPopup(new mapboxgl.Popup().setHTML(`<b>${location.name}</b><br>${day}`))
            .addTo(map);
    });
});

// Remove the call to center on user location during map load
map.on('load', function () {

    // Add the 3D buildings layer
    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
        }
    });

    // Set default light preset
    setAutoLightPreset();
});

// Toggle config panel
function toggleConfigPanel() {
    const configPanel = document.querySelector('.config-panel');
    configPanel.style.display = (configPanel.style.display === 'none' || configPanel.style.display === '') ? 'block' : 'none';
}

// Set light preset based on real time
function setAutoLightPreset() {
    const hour = new Date().getHours();
    let preset = 'day';
    if (hour >= 5 && hour < 8) {
        preset = 'dawn';
    } else if (hour >= 8 && hour < 18) {
        preset = 'day';
    } else if (hour >= 18 && hour < 20) {
        preset = 'dusk';
    } else {
        preset = 'night';
    }
    map.setConfigProperty('basemap', 'lightPreset', preset);
}

// Event listener for light preset changes
document.getElementById('lightPreset').addEventListener('change', function () {
    const selectedPreset = this.value;
    if (selectedPreset === 'auto') {
        setAutoLightPreset();
    } else {
        map.setConfigProperty('basemap', 'lightPreset', selectedPreset);
    }
});

// Event listener for style changes
document.getElementById('styleSelect').addEventListener('change', function () {
    map.setStyle(this.value);
});

// Event listeners for label toggles
document.querySelectorAll('.map-overlay-inner input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        map.setConfigProperty('basemap', this.id, this.checked);
    });
});
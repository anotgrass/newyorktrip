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

// Function to offset markers if they are too close to each other
function offsetCoordinates(coords, index, totalMarkers) {
    const offsetFactor = 0.0001; // Adjust this value to change the offset size
    const angle = (index / totalMarkers) * 2 * Math.PI;
    const offsetLng = Math.cos(angle) * offsetFactor;
    const offsetLat = Math.sin(angle) * offsetFactor;
    return [coords[0] + offsetLng, coords[1] + offsetLat];
}

// Track the current light preset selection
let currentLightPreset = 'auto';

// Set light preset based on real time or manual selection
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
    currentLightPreset = preset;
    map.setConfigProperty('basemap', 'lightPreset', preset);
}

// Apply the selected light preset manually
function applyLightPreset(preset) {
    currentLightPreset = preset;
    if (preset === 'auto') {
        setAutoLightPreset();
    } else {
        map.setConfigProperty('basemap', 'lightPreset', preset);
    }
}

// Event listener for style changes
document.getElementById('styleSelect').addEventListener('change', function () {
    const selectedStyle = this.value;
    map.setStyle(selectedStyle);

    // Reapply the light preset if the selected style is standard or standard satellite
    map.on('style.load', () => {
        if (selectedStyle === 'mapbox://styles/mapbox/standard' || selectedStyle === 'mapbox://styles/mapbox/standard-satellite') {
            applyLightPreset(currentLightPreset); // Reapply the light preset
        }
    });
});

// Event listener for light preset changes
document.getElementById('lightPreset').addEventListener('change', function () {
    const selectedPreset = this.value;
    applyLightPreset(selectedPreset);
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

    // Add markers with numbering, color, and offset for overlapping markers
    Object.keys(locations).forEach(day => {
        let count = 1;
        locations[day].forEach((location, index, array) => {
            // Offset coordinates if there are multiple markers
            const adjustedCoords = offsetCoordinates(location.coords, index, array.length);

            // Create the marker element
            const el = document.createElement('div');
            el.className = 'numbered-marker';
            el.style.backgroundColor = location.color; // Set the marker color dynamically
            el.innerText = count; // Add numbering

            // Create the marker
            new mapboxgl.Marker(el)
                .setLngLat(adjustedCoords)
                .setPopup(new mapboxgl.Popup().setHTML(`<b>${location.name}</b><br>${day}`))
                .addTo(map);

            count++;
        });
    });

    // Set default light preset
    setAutoLightPreset();
});

// Toggle config panel
function toggleConfigPanel() {
    const configPanel = document.querySelector('.config-panel');
    configPanel.style.display = (configPanel.style.display === 'none' || configPanel.style.display === '') ? 'block' : 'none';
}

// Event listeners for label toggles
document.querySelectorAll('.map-overlay-inner input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        map.setConfigProperty('basemap', this.id, this.checked);
    });
});
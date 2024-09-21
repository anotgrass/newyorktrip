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

// Apply dark mode settings from localStorage
let isDarkMode = localStorage.getItem('darkMode') === 'true';
applyDarkMode(isDarkMode);

// Update the dark mode toggle based on localStorage value
const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
    darkModeToggle.checked = isDarkMode;  // Ensure the toggle reflects the current mode
}

// Function to apply dark/light mode styling
function applyDarkMode(isDark) {
    const elementsToStyle = document.querySelectorAll('.config-panel, .bottom-panel, .panel-icon, .options-menu-btn, .layers-panel, .panel-icon i');
    const mapContainer = document.getElementById('map');

    if (isDark) {
        elementsToStyle.forEach(el => {
            el.style.backgroundColor = '#222';  // Dark background
            el.style.color = '#fff';  // White text
        });
        mapContainer.style.filter = 'brightness(0.8)';
    } else {
        elementsToStyle.forEach(el => {
            el.style.backgroundColor = '#fff';  // Light background
            el.style.color = '#000';  // Black text
        });
        mapContainer.style.filter = 'brightness(1)';
    }
}

// Variable to store the previous map state before zooming in
let previousMapState = {
    center: defaultCenter,
    zoom: defaultZoom,
    pitch: defaultPitch,
    bearing: defaultBearing
};

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

// Add markers with zoom functionality
map.on('load', function () {
    let activePopup = null; // Keep track of active popup

    Object.keys(locations).forEach(day => {
        let count = 1;

        locations[day].forEach(location => {
            const el = document.createElement('div');
            el.className = 'numbered-marker';
            el.style.backgroundColor = location.color;
            el.innerText = count;

            // Create a hover tooltip (popup)
            const hoverTooltip = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: 25
            }).setText(location.name);

            // Create a click popup for the marker
            const clickPopup = new mapboxgl.Popup({ closeOnClick: true })
                .setHTML(`
                    <b><center>${location.name}</center></b>
                    <b>${day}</b><br>
                    <b>Time:</b> ${location.time}<br>
                    ${location.website ? `<a href="${location.website}" target="_blank">Website</a><br><br>` : ''}
                    ${location.description}<br>
                `);

            // Create the marker
            const marker = new mapboxgl.Marker(el)
                .setLngLat(location.coords)
                .addTo(map);

            // Show tooltip on hover
            el.addEventListener('mouseenter', () => {
                hoverTooltip.setLngLat(location.coords).addTo(map);
            });

            // Hide tooltip when not hovering
            el.addEventListener('mouseleave', () => {
                hoverTooltip.remove();
            });

            // Zoom into the location and show popup when a marker is clicked
            el.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent map click event from firing
                if (activePopup) {
                    activePopup.remove(); // Close any open popups
                }

                // Save the current map state before zooming in
                previousMapState = {
                    center: map.getCenter(),
                    zoom: map.getZoom(),
                    pitch: map.getPitch(),
                    bearing: map.getBearing()
                };

                map.flyTo({
                    center: location.coords,
                    zoom: 15,
                    pitch: 45,
                    bearing: 0,
                    essential: true
                });

                // Set the active popup
                activePopup = clickPopup.setLngLat(location.coords).addTo(map);

                // Restore map state when popup is closed
                clickPopup.on('close', () => {
                    map.flyTo({
                        center: previousMapState.center,
                        zoom: previousMapState.zoom,
                        pitch: previousMapState.pitch,
                        bearing: previousMapState.bearing,
                        essential: true
                    });
                });
            });

            count++;
        });
    });

    // Close popup if clicking outside of a marker
    map.on('click', function () {
        if (activePopup) {
            activePopup.remove(); // Close the active popup
            activePopup = null;   // Reset the active popup variable

            // Restore map state after closing popup
            map.flyTo({
                center: previousMapState.center,
                zoom: previousMapState.zoom,
                pitch: previousMapState.pitch,
                bearing: previousMapState.bearing,
                essential: true
            });
        }
    });

    // Event listener for 3D Buildings toggle
    document.getElementById('toggleBuildings').addEventListener('change', function () {
        if (this.checked) {
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
        } else {
            if (map.getLayer('3d-buildings')) {
                map.removeLayer('3d-buildings');
            }
        }
    });

    // Event listener for Subway System toggle
    document.getElementById('toggleSubway').addEventListener('change', function () {
        if (this.checked) {
            map.addLayer({
                id: 'subway-lines',
                type: 'line',
                source: 'composite',
                'source-layer': 'transit',
                filter: ['==', 'class', 'subway'],
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#ff3135',  // Subway line color (red for visibility)
                    'line-width': 2.5
                }
            });
        } else {
            if (map.getLayer('subway-lines')) {
                map.removeLayer('subway-lines');
            }
        }
    });
});

// Event listener for Dark/Light Mode toggle with localStorage persistence
document.getElementById('toggleLightDarkMode').addEventListener('change', function () {
    const isDark = this.checked;
    applyDarkMode(isDark);
    localStorage.setItem('darkMode', isDark);
});

// Event listener for style changes
document.getElementById('styleSelect').addEventListener('change', function () {
    map.setStyle(this.value);
});

function setMapHeight() {
    const mapElement = document.getElementById('map');
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Adjust for browser inconsistencies
    mapElement.style.height = `${viewportHeight}px`;

    // Ensure the Mapbox map resizes correctly
    map.resize();
}

// Toggle config panel visibility
function toggleConfigPanel() {
    const configPanel = document.querySelector('.config-panel');
    const menuButton = document.querySelector('.options-menu-btn');
    const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';

    // Toggle between 'block' and 'none'
    configPanel.style.display = isExpanded ? 'none' : 'block';

    // Update aria-expanded
    menuButton.setAttribute('aria-expanded', !isExpanded);

    // Ensure the Mapbox map resizes correctly after panel is toggled
    map.resize();
}

// Add event listener to the menu button
document.querySelector('.options-menu-btn').addEventListener('click', toggleConfigPanel);

// Toggle layers panel visibility when clicking the layers button
function toggleLayersPanel() {
    const layersPanel = document.getElementById('layersPanel');
    layersPanel.classList.toggle('active');
}

// Add event listener to the layers button
document.getElementById('layersBtn').addEventListener('click', toggleLayersPanel);

// Set map height on page load, resize, and orientation change
window.addEventListener('load', setMapHeight);
window.addEventListener('resize', setMapHeight);
window.addEventListener('orientationchange', setMapHeight);
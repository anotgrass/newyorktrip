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

// Load and display the grouped locations from the GeoJSON file
map.on('load', function () {
    let activePopup = null; // Keep track of active popup

    fetch('./data/nyc-my-trip.geojson?nocache=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            const groupedLocations = {};

            // Group the locations by date
            data.features.forEach(feature => {
                const date = feature.properties.date;
                if (!groupedLocations[date]) {
                    groupedLocations[date] = [];
                }
                groupedLocations[date].push(feature);
            });

            // Add markers to the map for each date group
            Object.keys(groupedLocations).forEach((date) => {
                const locations = groupedLocations[date]; // Locations for the current date group

                locations.forEach((feature, count) => {
                    const coords = feature.geometry.coordinates;
                    const props = feature.properties;

                    // Create a marker element
                    const el = document.createElement('div');
                    el.className = 'numbered-marker';
                    el.style.backgroundColor = props.color || '#4264fb';

                    // Check if there are multiple locations in the group
                    if (locations.length > 1) {
                        // Set the marker to use letters A, B, C, etc.
                        el.innerText = String.fromCharCode(65 + count); // 'A' = 65 in ASCII
                    } else {
                        // No letter for single-location groups
                        el.innerText = ''; 
                    }

                    // Create a hover tooltip (popup)
                    const hoverTooltip = new mapboxgl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                        offset: 25
                    }).setText(props.name);

                    // Create a click popup for the marker
                    const clickPopup = new mapboxgl.Popup({ closeOnClick: true })
                        .setHTML(`
                            <b><center>${props.name}</center></b>
                            <b>${props.date}</b><br>
                            <b>Time:</b> ${props.time}<br>
                            ${props.website ? `<a href="${props.website}" target="_blank">Website</a><br><br>` : ''}
                            ${props.description}
                        `);

                    // Add the marker to the map
                    const marker = new mapboxgl.Marker(el)
                        .setLngLat(coords)
                        .addTo(map);

                    // Show tooltip on hover
                    el.addEventListener('mouseenter', () => {
                        hoverTooltip.setLngLat(coords).addTo(map);
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
                            center: coords,
                            zoom: 15,
                            pitch: 45,
                            bearing: 0,
                            essential: true
                        });

                        // Set the active popup
                        activePopup = clickPopup.setLngLat(coords).addTo(map);

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
                });
            });
        })
        .catch(err => console.error('Error loading GeoJSON:', err));


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
                'slot': 'top',
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
                'slot': 'middle',
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

    // Load the Central Park points layer from a GeoJSON file
    document.getElementById('toggleCentralPark').addEventListener('change', function () {
        if (this.checked) {
            if (!map.getSource('central-park-points')) {  // Check if the source doesn't already exist
                map.addSource('central-park-points', {
                    type: 'geojson',
                    data: './data/nyc-centralpark.geojson?nocache=' + new Date().getTime()  // Path to your GeoJSON file with cache-busting
                });
            }

            if (!map.getLayer('central-park-points-layer')) {  // Check if the layer doesn't already exist
                map.addLayer({
                    id: 'central-park-points-layer',
                    type: 'circle',
                    source: 'central-park-points',
                    paint: {
                        'circle-radius': 6,
                        'circle-color': '#007cbf',  // Customize the color of the points
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#fff'  // White outline for better visibility
                    }
                });

                let hoverTooltip = null;

                // Add hover functionality to Central Park points
                map.on('mouseenter', 'central-park-points-layer', function (e) {
                    // Change the cursor to a pointer when hovering over a point
                    map.getCanvas().style.cursor = 'pointer';

                    // Get coordinates and properties of the feature
                    const coords = e.features[0].geometry.coordinates.slice();
                    const props = e.features[0].properties;

                    // If a previous tooltip exists, remove it
                    if (hoverTooltip) hoverTooltip.remove();

                    // Create and show hover tooltip
                    hoverTooltip = new mapboxgl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                        offset: 25
                    })
                    .setLngLat(coords)
                    .setText(props.name)  // Display the name from the GeoJSON
                    .addTo(map);
                });

                // Remove the hover tooltip when the mouse leaves the point
                map.on('mouseleave', 'central-park-points-layer', function () {
                    map.getCanvas().style.cursor = '';  // Change cursor back to default
                    if (hoverTooltip) {
                        hoverTooltip.remove();  // Close the hover tooltip
                        hoverTooltip = null;  // Clear the reference to the popup
                    }
                });

                // Click event to display popup with more details
                map.on('click', 'central-park-points-layer', function (e) {
                    const coords = e.features[0].geometry.coordinates.slice();
                    const props = e.features[0].properties;

                    const clickPopup = new mapboxgl.Popup({ closeOnClick: true })
                        .setLngLat(coords)
                        .setHTML(`
                            <b><center>${props.name}</center></b>
                            <b>Description:</b> ${props.description || 'N/A'}<br>
                        `)
                        .addTo(map);

                    // Fly to the point when clicked
                    map.flyTo({
                        center: coords,
                        zoom: 15,
                        pitch: 45,
                        bearing: 0,
                        essential: true
                    });
                });
            }
        } else {
            if (map.getLayer('central-park-points-layer')) {
                map.removeLayer('central-park-points-layer');
            }
            if (map.getSource('central-park-points')) {
                map.removeSource('central-park-points');
            }
        }
    });

});

// Event listener for Dark/Light Mode toggle with localStorage persistence
document.getElementById('darkModeToggle').addEventListener('change', function () {
    const isDark = this.checked;
    applyDarkMode(isDark);
    localStorage.setItem('darkMode', isDark); // Store the current mode
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

// Disable double-click zoom on buttons and panels
const elementsToDisableZoom = document.querySelectorAll('.options-menu-btn, .panel-icon, .config-panel, .bottom-panel, .mapboxgl-ctrl, .mapboxgl-ctrl-geolocate, .mapboxgl-ctrl-navigation');
elementsToDisableZoom.forEach(el => {
    el.addEventListener('dblclick', function(event) {
        event.preventDefault();
        event.stopPropagation(); // Prevent the zoom event
    });
});

// Add event listener to the layers button
document.getElementById('layersBtn').addEventListener('click', toggleLayersPanel);

// Set map height on page load, resize, and orientation change
window.addEventListener('load', setMapHeight);
window.addEventListener('resize', setMapHeight);
window.addEventListener('orientationchange', setMapHeight);

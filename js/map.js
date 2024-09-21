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

// Toggle legend panel visibility
function toggleLegendPanel() {
    const legendPanel = document.querySelector('.legend-panel');
    legendPanel.style.display = (legendPanel.style.display === 'none' || legendPanel.style.display === '') ? 'block' : 'none';
}

// Function to generate the legend panel content dynamically
function createLegend() {
    const legendPanel = document.querySelector('.legend-panel');
    legendPanel.innerHTML = '<h3>Map Legend</h3>';

    Object.keys(locations).forEach(date => {
        // Add the date as a header
        const dateHeader = document.createElement('h4');
        dateHeader.textContent = date;
        legendPanel.appendChild(dateHeader);

        locations[date].forEach(location => {
            const locationLink = document.createElement('a');
            locationLink.href = '#';
            locationLink.textContent = `${location.time} - ${location.name}`;
            locationLink.onclick = () => {
                // Zoom to location when clicked
                map.flyTo({
                    center: location.coords,
                    zoom: 15,
                    pitch: 45,
                    bearing: 0,
                    essential: true
                });

                // Create a popup for the location
                const popup = new mapboxgl.Popup({ closeOnClick: true })
                    .setLngLat(location.coords)
                    .setHTML(`<b>${location.name}</b><br>${date} ${location.time}<br><a href="${location.website}" target="_blank">Website</a><br>${location.description}`)
                    .addTo(map);

                popup.on('close', () => {
                    // Reset map state after popup closes if necessary
                });
            };
            legendPanel.appendChild(locationLink);
        });
    });
}

// Create legend content on map load
map.on('load', function () {
    createLegend();
    
    // Add markers with zoom functionality
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
                    <b>Date:</b> ${day}<br>
                    <b>Time:</b> ${location.time}<br>
                    <a href="${location.website}" target="_blank">Website</a><br><br>
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

// Set map height based on viewport
function setMapHeight() {
    const mapElement = document.getElementById('map');
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Adjust for browser inconsistencies
    mapElement.style.height = `${viewportHeight}px`;

    // Ensure the Mapbox map resizes correctly
    map.resize();
}

// Set map height on page load, resize, and orientation change
window.addEventListener('load', setMapHeight);
window.addEventListener('resize', setMapHeight);
window.addEventListener('orientationchange', setMapHeight);
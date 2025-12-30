const MAP_CONFIG_LEAFLET = {
  center: [14.4644, 75.9217], // Davangere
  zoom: 13,
  searchRadiusKm: 8 // default search radius (can be set 5-10)
};

const SAMPLE_CLINICS_LEAFLET = [
  { id: 1, name: "Davangere Medical Center", address: "123 Hospital Road, Davangere, Karnataka 577001", phone: "+91 8192 234567", lat: 14.4650, lng: 75.9220, specialties: ["General Medicine","Cardiology"], rating: 4.8 },
  { id: 2, name: "City Health Clinic", address: "456 Main Street, Davangere, Karnataka 577002", phone: "+91 8192 345678", lat: 14.4640, lng: 75.9200, specialties: ["Pediatrics","Ophthalmology"], rating: 4.6 },
  { id: 3, name: "Apollo Care Center", address: "789 Railway Road, Davangere, Karnataka 577003", phone: "+91 8192 456789", lat: 14.4660, lng: 75.9250, specialties: ["Orthopedics","General Surgery"], rating: 4.7 },
  { id: 4, name: "Wellness Clinic Davangere", address: "321 Market Street, Davangere, Karnataka 577004", phone: "+91 8192 567890", lat: 14.4630, lng: 75.9180, specialties: ["Nutrition","Fitness Counseling"], rating: 4.5 },
  { id: 5, name: "Dr. Sharma's Diagnostic Center", address: "654 Garden Avenue, Davangere, Karnataka 577005", phone: "+91 8192 678901", lat: 14.4670, lng: 75.9240, specialties: ["Diagnostics","Pathology"], rating: 4.9 }
];

let leafletMap;
let leafletMarkers = [];

function initLeafletMap(options = {}) {
  const center = options.center || MAP_CONFIG_LEAFLET.center;
  const zoom = options.zoom || MAP_CONFIG_LEAFLET.zoom;
  const radiusKm = options.radiusKm || MAP_CONFIG_LEAFLET.searchRadiusKm;

  if (!document.getElementById('map')) return;

  leafletMap = L.map('map', { center, zoom, zoomControl: true });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(leafletMap);

  loadNearbyClinics(radiusKm).then((clinics) => {
    displayClinicsOnMap(clinics);
    displayClinicsList(clinics);
  }).catch(err => {
    console.error('Error loading clinics:', err);
    const container = document.getElementById('clincisContainer');
    if (container) container.innerHTML = '<div style="padding:12px;color:#6b7280;">Unable to load clinics.</div>';
  });
}

function loadNearbyClinics(radiusKm) {
  return new Promise((resolve) => {
    const results = SAMPLE_CLINICS_LEAFLET.filter(c => {
      const d = calculateDistance(MAP_CONFIG_LEAFLET.center[0], MAP_CONFIG_LEAFLET.center[1], c.lat, c.lng);
      return d <= radiusKm;
    });
    // simulate async
    setTimeout(() => resolve(results), 120);
  });
}

function displayClinicsOnMap(clinics) {
  clearLeafletMarkers();
  clinics.forEach(clinic => {
    const marker = L.circleMarker([clinic.lat, clinic.lng], {
      radius: 8,
      fillColor: '#f24e3e',
      color: '#fff',
      weight: 2,
      fillOpacity: 0.95
    }).addTo(leafletMap);

    const popupHtml = createClinicPopupHtml(clinic);
    marker.bindPopup(popupHtml, { minWidth: 220 });

    marker.on('click', () => {
      marker.openPopup();
      leafletMap.flyTo([clinic.lat, clinic.lng], 15, { duration: 0.6 });
    });

    leafletMarkers.push(marker);
  });
}

function createClinicPopupHtml(clinic) {
  const specialties = clinic.specialties && clinic.specialties.length ? clinic.specialties.join(', ') : '';
  return `
    <div style="font-family:Inter, sans-serif;">
      <h3 style="margin:0 0 6px;color:#0b9d8f;font-size:14px">${clinic.name}</h3>
      <p style="margin:4px 0;font-size:12px;color:#6b7280">${clinic.address}</p>
      <p style="margin:4px 0;font-size:12px;color:#6b7280">${clinic.phone ? '📞 ' + clinic.phone : ''}</p>
      <p style="margin:6px 0;font-size:12px">⭐ ${clinic.rating}/5</p>
      <div style="font-size:11px;margin-top:6px;color:#374151">${specialties}</div>
      <button onclick="bookClinicAppointment(${clinic.id}, '${escapeJsString(clinic.name)}')" style="margin-top:8px;padding:8px 10px;background:#0b9d8f;color:#fff;border:0;border-radius:6px;cursor:pointer">Book Appointment</button>
    </div>
  `;
}

function escapeJsString(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function displayClinicsList(clinics) {
  const container = document.getElementById('clincisContainer');
  if (!container) return;
  if (!clinics || clinics.length === 0) {
    container.innerHTML = '<div style="padding:12px;color:#6b7280">No clinics found within the selected radius.</div>';
    return;
  }

  container.innerHTML = clinics.map(c => {
    return `
      <div style="padding:12px;border:1px solid #e6efed;border-radius:8px;background:#fff;cursor:pointer" data-lat="${c.lat}" data-lng="${c.lng}" data-id="${c.id}">
        <h4 style="margin:0 0 6px;color:#0b9d8f;font-size:14px">${c.name}</h4>
        <p style="margin:4px 0;font-size:12px;color:#6b7280">${c.address}</p>
        <p style="margin:4px 0;font-size:12px;color:#6b7280">${c.phone ? '📞 ' + c.phone : ''}</p>
        <div style="font-size:12px;margin-top:6px">⭐ ${c.rating}/5 • ${c.specialties[0] || ''}</div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('div[data-id]').forEach(el => {
    el.addEventListener('click', () => {
      const lat = parseFloat(el.dataset.lat);
      const lng = parseFloat(el.dataset.lng);
      leafletMap.flyTo([lat, lng], 15, { duration: 0.6 });
    });
  });
}

function clearLeafletMarkers() {
  leafletMarkers.forEach(m => leafletMap.removeLayer(m));
  leafletMarkers = [];
}

function bookClinicAppointment(clinicId, clinicName) {
  alert(`Booking appointment at ${clinicName}.`);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Export init function to window for simple callback
window.initLeafletMap = initLeafletMap;

// Auto-init when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('map')) {
    // Delay slightly to allow layout to settle
    setTimeout(() => { try { initLeafletMap(); } catch(e) { console.error(e); } }, 80);
  }
});

const MAP_CONFIG = {
  center: { lat: 14.4644, lng: 75.9217 },
  zoom: 13,
  searchRadius: 8
};

const SAMPLE_CLINICS = [
  {
    id: 1,
    name: "Davangere Medical Center",
    address: "123 Hospital Road, Davangere, Karnataka 577001",
    phone: "+91 8192 234567",
    lat: 14.4650,
    lng: 75.9220,
    specialties: ["General Medicine", "Cardiology"],
    rating: 4.8
  },
  {
    id: 2,
    name: "City Health Clinic",
    address: "456 Main Street, Davangere, Karnataka 577002",
    phone: "+91 8192 345678",
    lat: 14.4640,
    lng: 75.9200,
    specialties: ["Pediatrics", "Ophthalmology"],
    rating: 4.6
  },
  {
    id: 3,
    name: "Apollo Care Center",
    address: "789 Railway Road, Davangere, Karnataka 577003",
    phone: "+91 8192 456789",
    lat: 14.4660,
    lng: 75.9250,
    specialties: ["Orthopedics", "General Surgery"],
    rating: 4.7
  },
  {
    id: 4,
    name: "Wellness Clinic Davangere",
    address: "321 Market Street, Davangere, Karnataka 577004",
    phone: "+91 8192 567890",
    lat: 14.4630,
    lng: 75.9180,
    specialties: ["Nutrition", "Fitness Counseling"],
    rating: 4.5
  },
  {
    id: 5,
    name: "Dr. Sharma's Diagnostic Center",
    address: "654 Garden Avenue, Davangere, Karnataka 577005",
    phone: "+91 8192 678901",
    lat: 14.4670,
    lng: 75.9240,
    specialties: ["Diagnostics", "Pathology"],
    rating: 4.9
  }
];

let map;
let markers = [];
let infoWindows = [];

function initMapWithClinics() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: MAP_CONFIG.zoom,
    center: MAP_CONFIG.center,
    styles: [
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#e6f7f4" }] },
      { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f7faf9" }] }
    ]
  });

  loadNearByClinics();
  // main office marker removed per request
}

function loadNearByClinics() { displayClinicsOnMap(SAMPLE_CLINICS); displayClinicsList(SAMPLE_CLINICS); }

function displayClinicsOnMap(clinics) {
  clinics.forEach((clinic) => {
    const marker = new google.maps.Marker({
      position: { lat: clinic.lat, lng: clinic.lng },
      map: map,
      title: clinic.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#f24e3e",
        fillOpacity: 0.9,
        strokeColor: "#fff",
        strokeWeight: 2
      }
    });

    const infoWindow = createClinicInfoWindow(clinic);
    
    marker.addListener("click", () => {
      closeAllInfoWindows();
      infoWindow.open(map, marker);
      map.panTo(marker.getPosition());
    });

    markers.push(marker);
    infoWindows.push(infoWindow);
  });
}

function createClinicInfoWindow(clinic) {
  const content = `
    <div style="font-family: Inter, sans-serif; padding: 12px; max-width: 280px;">
      <h3 style="margin: 0 0 8px; color: #0b9d8f; font-size: 14px; font-weight: 700;">
        ${clinic.name}
      </h3>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
        <p style="margin: 4px 0;">📍 ${clinic.address}</p>
        <p style="margin: 4px 0;">📞 ${clinic.phone}</p>
        <div style="margin: 6px 0;">
          <span style="color: #ffb703;">★</span> ${clinic.rating}/5
        </div>
      </div>
      <div style="font-size: 11px; margin: 8px 0; padding: 8px; background: #f0fbfb; border-radius: 6px;">
        <strong style="color: #0b9d8f;">Specialties:</strong><br>
        ${clinic.specialties.join(", ")}
      </div>
      <button onclick="bookClinicAppointment('${clinic.id}', '${clinic.name}')" 
              style="width: 100%; padding: 8px; background: #0b9d8f; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin-top: 8px;">
        Book Appointment
      </button>
    </div>
  `;

  return new google.maps.InfoWindow({ content });
}

function displayClinicsList(clinics) {
  const container = document.getElementById("clincisContainer");
  if (!container) return;
  container.innerHTML = clinics
    .map((clinic) => `
      <div style="padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s ease;" onclick="panToClinic(${clinic.lat}, ${clinic.lng})">
        <h4 style="margin: 0 0 6px; color: #0b9d8f; font-size: 13px; font-weight: 600;">${clinic.name}</h4>
        <p style="margin: 4px 0; font-size: 11px; color: #6b7280;">${clinic.address}</p>
        <p style="margin: 4px 0; font-size: 11px; color: #6b7280;">📞 ${clinic.phone}</p>
        <div style="margin: 6px 0; font-size: 11px;"><span style="color: #ffb703;">★</span> ${clinic.rating}/5 • ${clinic.specialties[0]}</div>
      </div>
    `)
    .join("");
}

function panToClinic(lat, lng) { map.panTo({ lat, lng }); map.setZoom(15); }

function bookClinicAppointment(clinicId, clinicName) { alert(`Booking appointment at ${clinicName}. This will redirect to booking form.`); }

function closeAllInfoWindows() { infoWindows.forEach((w) => w.close()); }

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

document.addEventListener("DOMContentLoaded", () => { if (document.getElementById("map")) { window.initMapWithClinics = initMapWithClinics; } });

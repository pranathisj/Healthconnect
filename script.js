// City-specific data for dynamic loading
const cityData = {
  davangere: {
    checkups: [
      { name: 'Basic Health Check', desc: 'Essential blood tests and vitals', price: '₹799' },
      { name: 'Diabetes Screening', desc: 'Blood sugar and related tests', price: '₹499' }
    ],
    services: [
      'Diagnostics',
      'Specialist Consultation',
      'Telemedicine'
    ],
    doctors: [
      { name: 'Dr. Susruth Maralihalli', specialization: 'General Surgeon' },
      { name: 'Dr. Hegde Rashmi', specialization: 'Gynecologist' }
    ],
    faqs: [
      { q: 'Is home sample collection available?', a: 'Available in selected localities, please contact support.' },
      { q: 'How do I book a checkup?', a: 'Select a checkup and click Book Now to request a consult.' }
    ]
  },
  bengaluru: {
    checkups: [
      { name: 'Full Body Checkup', desc: 'Comprehensive tests and doctor review', price: '₹1499' },
      { name: 'Women\'s Health Checkup', desc: 'Hormone and reproductive panel', price: '₹1299' }
    ],
    services: [
      'Diagnostics',
      'Telemedicine',
      'Wellness Plans',
      'Hospital Finder'
    ],
    doctors: [
      { name: 'Dr. Mallesh P', specialization: 'Cardiologist' },
      { name: 'Dr. Deepthi Ravishankar', specialization: 'Dermatologist' }
    ],
    faqs: [
      { q: 'Are clinics open on weekends?', a: 'Yes — many partner clinics operate on Saturdays.' },
      { q: 'How do I book?', a: 'Click Book Now on any package or doctor card to request a consult.' }
    ]
  }
};
// Basic interactive behavior for Health Care site
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  menuToggle?.addEventListener('click', () => {
    if (nav.style.display === 'flex') nav.style.display = '';
    else nav.style.display = 'flex';
  });

  const bookingModal = document.getElementById('bookingModal');
  const openBooking = document.getElementById('openBooking');
  const closeModal = document.getElementById('closeModal');
  const cancelBooking = document.getElementById('cancelBooking');
  const modalDesc = document.getElementById('modalDesc');

  function showModal(opts = {}) {
    bookingModal?.setAttribute('aria-hidden','false');
    bookingModal.style.display = 'flex';
    setTimeout(()=> bookingModal?.focus?.(), 80);
    if (opts.doc) modalDesc.textContent = `Request a consult with ${opts.doc}. We will confirm the time.`;
    if (opts.package) modalDesc.textContent = `Request booking for ${opts.package}. Select your preferred time slot below.`;
  }
  function hideModal() {
    bookingModal?.setAttribute('aria-hidden','true');
    bookingModal.style.display = 'none';
    modalDesc.textContent = 'Choose a slot and enter your contact details.';
  }

  openBooking?.addEventListener('click', () => showModal());
  closeModal?.addEventListener('click', hideModal);
  cancelBooking?.addEventListener('click', hideModal);

  document.getElementById('quickBook')?.addEventListener('click', () => showModal());

  document.querySelectorAll('.connect').forEach(btn => {
    btn.addEventListener('click', e => {
      const doc = e.currentTarget.dataset.doc;
      showModal({doc});
    });
  });

  document.querySelectorAll('[data-book]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pkg = e.currentTarget.dataset.book;
      showModal({package: pkg});
    });
  });

  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  contactForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    if (!name || !email) {
      formStatus.textContent = 'Please fill name and email.';
      formStatus.style.color = 'crimson';
      return;
    }
    formStatus.style.color = 'green';
    formStatus.textContent = 'Thanks! Your message has been received. We will reply to ' + email + '.';
    contactForm.reset();
  });

  const bookingForm = document.getElementById('bookingForm');
  const bookingStatus = document.getElementById('bookingStatus');
  bookingForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const bname = document.getElementById('bname').value.trim();
    const bphone = document.getElementById('bphone').value.trim();
    const bdate = document.getElementById('bdate').value;
    if (!bname || !bphone || !bdate) {
      bookingStatus.style.color = 'crimson';
      bookingStatus.textContent = 'Please fill all booking fields.';
      return;
    }
    bookingStatus.style.color = 'green';
    bookingStatus.textContent = `Thanks ${bname}! We requested a booking for ${bdate}. We'll contact ${bphone}.`;
    setTimeout(() => {
      hideModal();
      bookingForm.reset();
      bookingStatus.textContent = '';
    }, 2000);
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  const hospitalMap = document.getElementById('hospitalMap');
  if (hospitalMap) {
    hospitalMap.addEventListener('click', () => {
      const mapsUrl = 'https://www.google.com/maps/search/123+Wellness+Ave,+City/@28.6139,77.2090,15z';
      window.open(mapsUrl, '_blank');
    });
    hospitalMap.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const mapsUrl = 'https://www.google.com/maps/search/123+Wellness+Ave,+City/@28.6139,77.2090,15z';
        window.open(mapsUrl, '_blank');
      }
    });
  }
});

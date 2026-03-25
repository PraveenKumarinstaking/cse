/* ========================================
   CSE Department Website - User-Side JS
   Reads data from localStorage and renders
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initPage();
});

/* ── Navbar ── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });

    // Close on link click
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
      });
    });
  }
}

/* ── Page Detection & Rendering ── */
function initPage() {
  const path = window.location.pathname;

  if (path.includes('faculty.html')) {
    renderFaculty();
  } else if (path.includes('events.html')) {
    renderEvents();
  } else if (path.includes('gallery.html')) {
    renderGallery();
    initLightbox();
  }
}

/* ── Faculty Page ── */
function renderFaculty() {
  const grid = document.getElementById('facultyGrid');
  const loader = document.getElementById('facultyLoader');
  const empty = document.getElementById('facultyEmpty');
  
  const faculty = JSON.parse(localStorage.getItem('cse_faculty') || '[]');

  // Simulate brief load
  setTimeout(() => {
    if (loader) loader.style.display = 'none';

    if (faculty.length === 0) {
      if (empty) empty.style.display = 'block';
      // Show default sample data
      const defaults = getDefaultFaculty();
      defaults.forEach((f, i) => {
        grid.innerHTML += createFacultyCard(f, i);
      });
      if (empty) empty.style.display = 'none';
      return;
    }

    faculty.forEach((f, i) => {
      grid.innerHTML += createFacultyCard(f, i);
    });
  }, 400);
}

function createFacultyCard(f, index) {
  const initials = f.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const delay = index * 0.1;
  
  return `
    <div class="card faculty-card" style="animation: fadeInUp 0.5s ease ${delay}s both;">
      <div class="card-body">
        <div class="faculty-avatar">${initials}</div>
        <h3>${escapeHtml(f.name)}</h3>
        <p class="card-subtitle">${escapeHtml(f.designation)}</p>
        <p>${escapeHtml(f.specialization || '')}</p>
        <p class="qualification">${escapeHtml(f.qualification || '')}</p>
      </div>
    </div>
  `;
}

function getDefaultFaculty() {
  return [
    { name: 'Dr. Sample Faculty', designation: 'Professor & HOD', specialization: 'Artificial Intelligence', qualification: 'Ph.D in CSE' },
    { name: 'Mrs. Example Staff', designation: 'Associate Professor', specialization: 'Data Science', qualification: 'M.E in CSE' },
    { name: 'Mr. Demo Teacher', designation: 'Assistant Professor', specialization: 'Software Engineering', qualification: 'M.Tech in CSE' },
    { name: 'Dr. Test Professor', designation: 'Associate Professor', specialization: 'Machine Learning', qualification: 'Ph.D in CSE' },
    { name: 'Mrs. Sample Lecturer', designation: 'Assistant Professor', specialization: 'Computer Networks', qualification: 'M.E in CSE' },
    { name: 'Mr. Demo Assistant', designation: 'Assistant Professor', specialization: 'Cloud Computing', qualification: 'M.Tech in IT' }
  ];
}

/* ── Events Page ── */
function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  const loader = document.getElementById('eventsLoader');
  const empty = document.getElementById('eventsEmpty');

  const events = JSON.parse(localStorage.getItem('cse_events') || '[]');

  setTimeout(() => {
    if (loader) loader.style.display = 'none';

    if (events.length === 0) {
      // Show default sample events
      const defaults = getDefaultEvents();
      defaults.forEach((e, i) => {
        grid.innerHTML += createEventCard(e, i);
      });
      return;
    }

    // Sort by date, newest first
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    events.forEach((e, i) => {
      grid.innerHTML += createEventCard(e, i);
    });
  }, 400);
}

function createEventCard(e, index) {
  const delay = index * 0.1;
  const dateStr = e.date ? new Date(e.date).toLocaleDateString('en-IN', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }) : '';
  
  const typeColors = {
    'Workshop': '#3b82f6',
    'Seminar': '#8b5cf6',
    'Competition': '#f59e0b',
    'Cultural': '#ec4899',
    'Guest Lecture': '#10b981',
    'Other': '#6b7280'
  };
  const typeColor = typeColors[e.type] || typeColors['Other'];
  
  return `
    <div class="card" style="animation: fadeInUp 0.5s ease ${delay}s both;">
      <div class="card-body">
        <div style="display:inline-block; padding:0.25rem 0.8rem; background:${typeColor}20; color:${typeColor}; border-radius:50px; font-size:0.75rem; font-weight:600; margin-bottom:0.8rem;">
          ${escapeHtml(e.type || 'Event')}
        </div>
        <h3>${escapeHtml(e.title)}</h3>
        <p style="margin-top:0.5rem;">${escapeHtml(e.description || '')}</p>
      </div>
      <div class="card-meta">
        <span>📅 ${dateStr}</span>
        ${e.venue ? `<span style="margin-left:auto;">📍 ${escapeHtml(e.venue)}</span>` : ''}
      </div>
    </div>
  `;
}

function getDefaultEvents() {
  return [
    { title: 'Workshop on Machine Learning', type: 'Workshop', date: '2026-03-15', description: 'A hands-on workshop covering ML fundamentals, supervised learning, and real-world applications.', venue: 'CSE Lab' },
    { title: 'National Level Technical Symposium', type: 'Competition', date: '2026-03-01', description: 'Annual national-level technical symposium featuring coding competitions, paper presentations, and project exhibitions.', venue: 'Auditorium' },
    { title: 'Guest Lecture on Cybersecurity', type: 'Guest Lecture', date: '2026-02-20', description: 'Expert talk on modern cybersecurity threats and defense strategies by industry professionals.', venue: 'Seminar Hall' }
  ];
}

/* ── Gallery Page ── */
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const loader = document.getElementById('galleryLoader');
  const empty = document.getElementById('galleryEmpty');

  const gallery = JSON.parse(localStorage.getItem('cse_gallery') || '[]');

  setTimeout(() => {
    if (loader) loader.style.display = 'none';

    if (gallery.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }

    gallery.forEach((item, i) => {
      const delay = i * 0.08;
      grid.innerHTML += `
        <div class="gallery-item" style="animation: fadeInUp 0.5s ease ${delay}s both;" onclick="openLightbox('${item.image}')">
          <img src="${item.image}" alt="${escapeHtml(item.caption || 'Gallery Image')}" loading="lazy">
          <div class="overlay">${escapeHtml(item.caption || '')}</div>
        </div>
      `;
    });
  }, 400);
}

/* ── Lightbox ── */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightboxClose');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  if (lightbox && img) {
    img.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ── Utility ── */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

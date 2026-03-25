/* ========================================
   CSE Department Website - Admin JS
   CRUD operations, auth, localStorage
   ======================================== */

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'cms@cse2026';
const AUTH_KEY = 'cse_admin_auth';

document.addEventListener('DOMContentLoaded', () => {
  initAdminPage();
});

/* ── Auth ── */
function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function loginAdmin(username, password) {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

function logoutAdmin() {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/* ── Page Init ── */
function initAdminPage() {
  const path = window.location.pathname;

  if (path.includes('login.html')) {
    initLoginPage();
  } else if (path.includes('dashboard.html')) {
    if (requireAuth()) initDashboard();
  } else if (path.includes('admin/faculty.html') || path.endsWith('admin\\faculty.html')) {
    if (requireAuth()) initFacultyAdmin();
  } else if (path.includes('admin/events.html') || path.endsWith('admin\\events.html')) {
    if (requireAuth()) initEventsAdmin();
  } else if (path.includes('admin/gallery.html') || path.endsWith('admin\\gallery.html')) {
    if (requireAuth()) initGalleryAdmin();
  }
}

/* ── Login Page ── */
function initLoginPage() {
  const form = document.getElementById('loginForm');
  const error = document.getElementById('loginError');

  if (isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (loginAdmin(username, password)) {
        window.location.href = 'dashboard.html';
      } else {
        error.style.display = 'block';
        error.textContent = '❌ Invalid username or password';
        setTimeout(() => { error.style.display = 'none'; }, 3000);
      }
    });
  }
}

/* ── Dashboard ── */
function initDashboard() {
  const faculty = JSON.parse(localStorage.getItem('cse_faculty') || '[]');
  const events = JSON.parse(localStorage.getItem('cse_events') || '[]');
  const gallery = JSON.parse(localStorage.getItem('cse_gallery') || '[]');

  const el = (id) => document.getElementById(id);
  if (el('facultyCount')) el('facultyCount').textContent = faculty.length;
  if (el('eventsCount')) el('eventsCount').textContent = events.length;
  if (el('galleryCount')) el('galleryCount').textContent = gallery.length;
}

/* ══════════════════════════════════════
   FACULTY MANAGEMENT
   ══════════════════════════════════════ */
let editingFacultyId = null;

function initFacultyAdmin() {
  renderFacultyTable();
  
  const addBtn = document.getElementById('addFacultyBtn');
  const modal = document.getElementById('facultyModal');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('facultyForm');

  addBtn.addEventListener('click', () => {
    editingFacultyId = null;
    form.reset();
    document.getElementById('modalTitle').textContent = 'Add Faculty Member';
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveFaculty();
  });
}

function renderFacultyTable() {
  const tbody = document.getElementById('facultyTableBody');
  const empty = document.getElementById('facultyEmpty');
  const faculty = JSON.parse(localStorage.getItem('cse_faculty') || '[]');

  if (faculty.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  tbody.innerHTML = faculty.map((f, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(f.name)}</strong></td>
      <td>${escapeHtml(f.designation)}</td>
      <td>${escapeHtml(f.qualification)}</td>
      <td>${escapeHtml(f.specialization)}</td>
      <td class="actions">
        <button class="edit-btn" onclick="editFaculty('${f.id}')">✏️ Edit</button>
        <button class="delete-btn" onclick="deleteFaculty('${f.id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function saveFaculty() {
  const faculty = JSON.parse(localStorage.getItem('cse_faculty') || '[]');
  
  const data = {
    id: editingFacultyId || generateId(),
    name: document.getElementById('fName').value.trim(),
    designation: document.getElementById('fDesignation').value.trim(),
    qualification: document.getElementById('fQualification').value.trim(),
    specialization: document.getElementById('fSpecialization').value.trim(),
    email: document.getElementById('fEmail').value.trim(),
    experience: document.getElementById('fExperience').value.trim()
  };

  if (editingFacultyId) {
    const index = faculty.findIndex(f => f.id === editingFacultyId);
    if (index !== -1) faculty[index] = data;
    showToast('Faculty member updated successfully!', 'success');
  } else {
    faculty.push(data);
    showToast('Faculty member added successfully!', 'success');
  }

  localStorage.setItem('cse_faculty', JSON.stringify(faculty));
  document.getElementById('facultyModal').classList.remove('active');
  renderFacultyTable();
  editingFacultyId = null;
}

function editFaculty(id) {
  const faculty = JSON.parse(localStorage.getItem('cse_faculty') || '[]');
  const f = faculty.find(item => item.id === id);
  if (!f) return;

  editingFacultyId = id;
  document.getElementById('fName').value = f.name || '';
  document.getElementById('fDesignation').value = f.designation || '';
  document.getElementById('fQualification').value = f.qualification || '';
  document.getElementById('fSpecialization').value = f.specialization || '';
  document.getElementById('fEmail').value = f.email || '';
  document.getElementById('fExperience').value = f.experience || '';
  document.getElementById('modalTitle').textContent = 'Edit Faculty Member';
  document.getElementById('facultyModal').classList.add('active');
}

function deleteFaculty(id) {
  if (!confirm('Are you sure you want to delete this faculty member?')) return;
  let faculty = JSON.parse(localStorage.getItem('cse_faculty') || '[]');
  faculty = faculty.filter(f => f.id !== id);
  localStorage.setItem('cse_faculty', JSON.stringify(faculty));
  renderFacultyTable();
  showToast('Faculty member deleted!', 'success');
}

/* ══════════════════════════════════════
   EVENTS MANAGEMENT
   ══════════════════════════════════════ */
let editingEventId = null;

function initEventsAdmin() {
  renderEventsTable();

  const addBtn = document.getElementById('addEventBtn');
  const modal = document.getElementById('eventModal');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('eventForm');

  addBtn.addEventListener('click', () => {
    editingEventId = null;
    form.reset();
    document.getElementById('modalTitle').textContent = 'Add Event';
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEvent();
  });
}

function renderEventsTable() {
  const tbody = document.getElementById('eventsTableBody');
  const empty = document.getElementById('eventsEmpty');
  const events = JSON.parse(localStorage.getItem('cse_events') || '[]');

  if (events.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  tbody.innerHTML = events.map((e, i) => {
    const dateStr = e.date ? new Date(e.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    return `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${escapeHtml(e.title)}</strong></td>
        <td>${escapeHtml(e.type)}</td>
        <td>${dateStr}</td>
        <td>${escapeHtml(e.venue || '-')}</td>
        <td class="actions">
          <button class="edit-btn" onclick="editEvent('${e.id}')">✏️ Edit</button>
          <button class="delete-btn" onclick="deleteEvent('${e.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function saveEvent() {
  const events = JSON.parse(localStorage.getItem('cse_events') || '[]');

  const data = {
    id: editingEventId || generateId(),
    title: document.getElementById('eTitle').value.trim(),
    type: document.getElementById('eType').value,
    date: document.getElementById('eDate').value,
    venue: document.getElementById('eVenue').value.trim(),
    description: document.getElementById('eDescription').value.trim()
  };

  if (editingEventId) {
    const index = events.findIndex(e => e.id === editingEventId);
    if (index !== -1) events[index] = data;
    showToast('Event updated successfully!', 'success');
  } else {
    events.push(data);
    showToast('Event added successfully!', 'success');
  }

  localStorage.setItem('cse_events', JSON.stringify(events));
  document.getElementById('eventModal').classList.remove('active');
  renderEventsTable();
  editingEventId = null;
}

function editEvent(id) {
  const events = JSON.parse(localStorage.getItem('cse_events') || '[]');
  const e = events.find(item => item.id === id);
  if (!e) return;

  editingEventId = id;
  document.getElementById('eTitle').value = e.title || '';
  document.getElementById('eType').value = e.type || 'Other';
  document.getElementById('eDate').value = e.date || '';
  document.getElementById('eVenue').value = e.venue || '';
  document.getElementById('eDescription').value = e.description || '';
  document.getElementById('modalTitle').textContent = 'Edit Event';
  document.getElementById('eventModal').classList.add('active');
}

function deleteEvent(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  let events = JSON.parse(localStorage.getItem('cse_events') || '[]');
  events = events.filter(e => e.id !== id);
  localStorage.setItem('cse_events', JSON.stringify(events));
  renderEventsTable();
  showToast('Event deleted!', 'success');
}

/* ══════════════════════════════════════
   GALLERY MANAGEMENT
   ══════════════════════════════════════ */

function initGalleryAdmin() {
  renderGalleryGrid();

  const addBtn = document.getElementById('addGalleryBtn');
  const modal = document.getElementById('galleryModal');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('galleryForm');

  addBtn.addEventListener('click', () => {
    form.reset();
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Upload Image';
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  // Image preview
  const fileInput = document.getElementById('gImage');
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const preview = document.getElementById('imagePreview');
        preview.src = ev.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveGalleryImage();
  });
}

function renderGalleryGrid() {
  const grid = document.getElementById('galleryAdminGrid');
  const empty = document.getElementById('galleryEmpty');
  const gallery = JSON.parse(localStorage.getItem('cse_gallery') || '[]');

  if (gallery.length === 0) {
    if (grid) grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  grid.innerHTML = gallery.map((item, i) => `
    <div class="card" style="animation: fadeInUp 0.4s ease ${i * 0.05}s both;">
      <img src="${item.image}" alt="${escapeHtml(item.caption)}" class="card-image" style="height:180px;">
      <div class="card-body">
        <p style="font-size:0.85rem;">${escapeHtml(item.caption || 'No caption')}</p>
      </div>
      <div class="card-meta">
        <span>${item.uploadDate ? new Date(item.uploadDate).toLocaleDateString('en-IN') : ''}</span>
        <button class="delete-btn" style="margin-left:auto; padding:0.3rem 0.7rem; font-size:0.78rem; cursor:pointer; background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.2); border-radius:6px;" onclick="deleteGalleryImage('${item.id}')">🗑️ Delete</button>
      </div>
    </div>
  `).join('');
}

function saveGalleryImage() {
  const fileInput = document.getElementById('gImage');
  const caption = document.getElementById('gCaption').value.trim();
  const file = fileInput.files[0];

  if (!file) {
    showToast('Please select an image file!', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const gallery = JSON.parse(localStorage.getItem('cse_gallery') || '[]');
    gallery.push({
      id: generateId(),
      image: e.target.result,
      caption: caption,
      uploadDate: new Date().toISOString()
    });

    try {
      localStorage.setItem('cse_gallery', JSON.stringify(gallery));
      showToast('Image uploaded successfully!', 'success');
      document.getElementById('galleryModal').classList.remove('active');
      renderGalleryGrid();
    } catch (err) {
      showToast('Image too large! Please use a smaller image.', 'error');
    }
  };
  reader.readAsDataURL(file);
}

function deleteGalleryImage(id) {
  if (!confirm('Are you sure you want to delete this image?')) return;
  let gallery = JSON.parse(localStorage.getItem('cse_gallery') || '[]');
  gallery = gallery.filter(g => g.id !== id);
  localStorage.setItem('cse_gallery', JSON.stringify(gallery));
  renderGalleryGrid();
  showToast('Image deleted!', 'success');
}

/* ── Utilities ── */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  // Remove existing toast
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

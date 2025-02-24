<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid px-4">
      <!-- Project Heading -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img src="@/assets/Test.jpg" alt="Test Vista Logo" class="brand-logo" />
      </router-link>

      <!-- Toggler for Offcanvas -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="offcanvas offcanvas-end" id="offcanvasNavbar">
        <div class="offcanvas-header justify-content-end align-items-end">
          <button
            type="button"
            class="btn-close btn-close-white text-reset fs-3"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav desktop-center">
            <li class="nav-item">
              <router-link
                class="nav-link pb-0"
                id="navBoard"
                to="/admin/board"
                @click="closeOffcanvas"
              >
                Board
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/admin/syllabus"
                class="nav-link pb-0"
                id="navSyllabus"
                @click="closeOffcanvas"
              >
                Syllabus
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/admin/pattern"
                class="nav-link pb-0"
                id="navPattern"
                @click="closeOffcanvas"
              >
                Pattern
              </router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link pb-0 disabled" id="navQuestion" href="#">Question Bank</a>
            </li>
            <li class="nav-item">
              <router-link
                to="/admin/school"
                class="nav-link pb-0"
                id="navSchool"
                @click="closeOffcanvas"
              >
                School
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/admin/teacher"
                class="nav-link pb-0"
                id="navTeacher"
                @click="closeOffcanvas"
              >
                Teacher
              </router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link pb-0 disabled" id="navProfile" href="#">Profile</a>
            </li>
          </ul>
          <div class="navbar-nav">
            <a class="nav-link pb-0 link-danger btn-danger" id="navLogout" @click="showLogoutModal">
              Logout <strong><i class="bi bi-box-arrow-right"></i></strong>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Logout Confirmation Modal -->
  <div
    class="modal fade"
    id="logoutModal"
    tabindex="-1"
    aria-labelledby="logoutModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="logoutModalLabel">Confirm Logout</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">Are you sure you want to logout?</div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-light"
            style="border: 1px solid gray"
            data-bs-dismiss="modal"
          >
            Cancel
          </button>
          <button @click="handleLogout" class="btn btn-danger">Logout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Modal, Offcanvas } from 'bootstrap'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
let logoutModal: Modal | null = null
let offcanvasInstance: Offcanvas | null = null

onMounted(() => {
  const modalElement = document.getElementById('logoutModal')
  const offcanvasElement = document.getElementById('offcanvasNavbar')

  if (modalElement) {
    logoutModal = new Modal(modalElement)
  }

  if (offcanvasElement) {
    offcanvasInstance = new Offcanvas(offcanvasElement, {
      backdrop: 'static',
      keyboard: false,
    })
  }
})

const showLogoutModal = () => {
  logoutModal?.show()
}

const handleLogout = () => {
  logoutModal?.hide()
  // Clear any auth tokens or user data from localStorage
  localStorage.clear()
  router.push('/login')
}

const closeOffcanvas = () => {
  if (offcanvasInstance) {
    offcanvasInstance.hide()
    const backdrop = document.querySelector('.offcanvas-backdrop')
    if (backdrop) {
      backdrop.remove()
    }
  }
}
</script>

<style scoped>
/* General Styling */
.navbar {
  background-color: black !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100px;
  padding-bottom: 10px;
}

.container-fluid {
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.brand-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  margin-bottom: 0;
  margin-top: 50px;
}

.navbar-brand {
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  align-items: flex-start;
}

.offcanvas {
  background-color: black !important;
}

.offcanvas-header {
  border-bottom: 1px solid #ffffff;
}

.nav-link {
  font-size: 17px;
  color: white !important;
  text-transform: uppercase;
  transition: color 0.3s ease;
  white-space: nowrap;
  padding: 0 10px;
}

/* Add spacing between nav links for larger screens */
@media (min-width: 1200px) {
  .nav-item {
    margin: 0 7px; /* Add horizontal margin to create gaps */
  }

  .nav-link {
    padding: 0 5px; /* Adjust padding for better spacing */
  }

  /* Remove margin from the first and last items to maintain alignment */
  .nav-item:first-child {
    margin-left: 0;
  }

  .nav-item:last-child {
    margin-right: 0;
  }
}

.nav-link:hover {
  color: #ffc107 !important;
  text-decoration: underline;
  text-decoration-color: #ffc107;
}

#navLogout {
  color: red !important;
  font-weight: 600;
}

#navLogout:hover {
  text-decoration: underline !important;
  text-decoration-color: red !important;
}

.nav-link.disabled {
  color: #6c757d !important;
  cursor: not-allowed;
}

.nav-link.disabled:hover {
  text-decoration: none !important;
  color: #6c757d !important;
}

/* Active link styling */
.router-link-active:not(.navbar-brand) {
  font-weight: bold !important;
  text-decoration: underline !important;
  text-decoration-color: white !important;
}

/* Desktop Navigation Alignment */
.navbar-nav.desktop-center {
  margin-left: auto;
  margin-right: auto;
  align-items: flex-end;
}

.navbar-nav {
  align-items: flex-end;
}

@media (max-width: 768px) {
  #offcanvasNavbar.offcanvas-end {
    width: 75% !important;
    max-width: 75% !important;
  }

  .offcanvas-header {
    height: 101px;
  }

  .offcanvas-body {
    display: flex;
    flex-direction: column;
    height: calc(100% - 101px);
    position: relative;
    padding: 1rem;
  }

  /* Mobile Navigation Alignment */
  .navbar-nav.desktop-center {
    margin: 0 !important;
    align-items: flex-start !important;
    width: 100%;
  }

  .offcanvas .navbar-nav {
    justify-content: flex-start !important;
    align-items: flex-start !important;
    flex-grow: 1;
    flex-wrap: nowrap;
  }

  .offcanvas .nav-link {
    text-align: left !important;
    padding-left: 0;
    padding-bottom: 1rem !important;
    font-size: 20px !important;
  }

  #navLogout {
    position: absolute !important;
    bottom: 1rem !important;
    left: 1.5rem !important;
    font-size: 20px !important;
    width: calc(100% - 2rem);
    text-align: left;
    padding-left: 0;
  }

  #navLogout:hover {
    border-radius: 4px;
    text-decoration: underline !important;
    text-decoration-color: red !important;
  }
}

.navbar-toggler {
  background-color: transparent !important;
  border: none !important;
  padding: 0;
}

.navbar-toggler:focus {
  box-shadow: none !important;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 1)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
}
</style>

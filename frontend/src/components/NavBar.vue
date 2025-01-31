<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container w-100 h-100">
      <div
        class="row w-100 h-100 align-items-end justify-content-center"
        style="margin-left: unset"
      >
        <!-- Project Heading -->
        <div class="col-8 col-lg-2 text-lg-start">
          <router-link class="navbar-brand" to="/" style="font-size: 27px">TEST VISTA</router-link>
        </div>

        <!-- Toggler for Offcanvas -->
        <div class="col-4 col-lg-8 ps-2 text-end">
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
              <ul class="navbar-nav justify-content-end align-items-end flex-grow-1 flex-nowrap">
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
                    to="/admin/school"
                    class="nav-link"
                    id="navSchool"
                    @click="closeOffcanvas"
                  >
                    School
                  </router-link>
                </li>
                <li class="nav-item">
                  <a class="nav-link pb-0 disabled" id="navTeacher" href="#">Teacher</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link pb-0 disabled" id="navSyllabus" href="#">Syllabus</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link pb-0 disabled" id="navQuestion" href="#">Question Bank</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link pb-0 disabled" id="navPattern" href="#">Pattern</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link pb-0 disabled" id="navProfile" href="#">Profile</a>
                </li>
                <li class="nav-item pe-0">
                  <a
                    class="nav-link pb-0 link-danger btn-danger"
                    id="navLogout"
                    @click="showLogoutModal"
                  >
                    Logout <strong><i class="bi bi-box-arrow-right"></i></strong>
                  </a>
                </li>
              </ul>
            </div>
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
  padding-left: 0;
  padding-right: 0;
}

.navbar-brand {
  color: white !important;
  font-weight: bold;
}

.nav-link {
  font-size: 20px;
  color: white !important;
  text-transform: uppercase;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: #ffc107 !important;
  text-decoration: underline;
  text-decoration-color: #ffc107;
}
#navSchool {
  padding-top: 0;
  padding-bottom: 0;
  line-height: 1.5; /* Ensure consistency */
}

.nav-link.disabled {
  color: #6c757d !important;
  cursor: not-allowed;
}

.nav-link.disabled:hover {
  color: #6c757d !important;
  text-decoration: none;
}

.navbar-toggler {
  background-color: black;
  font-size: 1.2rem;
}

.offcanvas {
  background-color: black !important;
}

.offcanvas-header {
  border-bottom: 1px solid #495057;
}

.navbar-nav .nav-item {
  padding-left: 10px;
  padding-right: 10px;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath stroke='white' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E") !important;
}

#navLogout:hover {
  text-decoration: underline !important;
  text-decoration-color: red !important;
}

#navLogout {
  color: red !important;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 768px) {
  #offcanvasNavbar.offcanvas-end {
    width: 75% !important;
    max-width: 75% !important;
  }

  .offcanvas-header {
    height: 101px;
  }

  .offcanvas .navbar-nav {
    justify-content: start !important;
    align-items: start !important;
  }

  .offcanvas .nav-link {
    text-align: left !important;
    padding-left: 1rem;
    padding-bottom: 1rem !important;
  }

  #navLogout:hover {
    border-radius: 4px;
    text-decoration: underline !important;
    text-decoration-color: red !important;
  }

  #navLogout {
    position: absolute !important;
    bottom: 1rem !important;
    left: 1.5rem !important;
    font-size: 1rem !important;
    width: calc(100% - 2rem);
    text-align: left;
  }
}
</style>

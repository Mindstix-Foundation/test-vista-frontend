<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0">Teacher Dashboard</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Dashboard Content -->
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="row row-cols-1 row-cols-md-3 g-4">
          <!-- Syllabus Card - Hidden for now -->
          <div class="col hidden-card">
            <div class="card h-100 card-hover">
              <div class="card-body">
                <h5 class="card-title"><i class="bi bi-book"></i> Syllabus</h5>
                <p class="card-text">View and access the complete syllabus for your assigned classes and subjects.</p>
              </div>
              <div class="card-footer bg-transparent border-0 text-end">
                <router-link to="/teacher/syllabus" class="btn btn-outline-primary btn-sm">View Syllabus</router-link>
              </div>
            </div>
          </div>

          <!-- Profile Card -->
          <div class="col">
            <div class="card h-100 card-hover">
              <div class="card-body">
                <h5 class="card-title"><i class="bi bi-person"></i> My Profile</h5>
                <p class="card-text">View and update your personal information and contact details.</p>
              </div>
              <div class="card-footer bg-transparent border-0 text-end">
                <router-link to="/teacher/profile" class="btn btn-outline-primary btn-sm">View Profile</router-link>
              </div>
            </div>
          </div>

          <!-- Test Papers Card - Hidden for now -->
          <div class="col hidden-card">
            <div class="card h-100 card-hover">
              <div class="card-body">
                <h5 class="card-title"><i class="bi bi-file-earmark-text"></i> Test Papers</h5>
                <p class="card-text">View and manage previous test papers for your classes.</p>
              </div>
              <div class="card-footer bg-transparent border-0 text-end">
                <router-link to="/teacher/previous-test-paper" class="btn btn-outline-primary btn-sm">View Test Papers</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No special logic needed for this component
</script>

<style scoped>
/* Hidden Cards */
.hidden-card {
  display: none !important;
}

.card-hover {
  transition: box-shadow 0.3s ease;
}

.card-hover:not(.disabled-card):hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.disabled-card {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 
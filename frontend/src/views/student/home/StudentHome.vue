<template>
  <div class="foundation-home">
    <!-- Main Content -->
    <div class="container mt-4 mb-5">
      <!-- Hero Section -->
      <div class="row justify-content-center mb-5">
        <div class="col-12 col-lg-10">
          <div class="hero-section text-center">
            <h1 class="display-4 fw-bold text-dark mb-3">Mindstix Foundation Trust</h1>
            <h2 class="h4 text-secondary mb-4">Technology Provider For A Social Change</h2>
            <div class="hero-actions">
              <button class="btn btn-outline-dark btn-lg mb-2" @click="scrollToAbout">
                More About Us
              </button>
            </div>
            <div class="scroll-indicator mt-4">
              <p class="text-muted small mb-2">Scroll</p>
              <i class="bi bi-chevron-down text-muted animate-bounce"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="row justify-content-center" id="about-section">
        <div class="col-12 col-lg-10">
          <div class="about-section">
            <h3 class="h2 fw-bold text-dark mb-4 text-center">Who We Are</h3>
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4 p-md-5">
                <p class="lead text-justify lh-lg">
                  Mindstix Foundation Trust is a Pan-India Trust based in Mumbai, Maharashtra. 
                  Primarily, we work for the economically constrained populace of the country 
                  for the upliftment of the society by digital means. We strive for social 
                  transformation and aim to serve the community with the goal of transformation 
                  through digital intervention.
                </p>
                <p class="text-justify lh-lg">
                  We believe that social transformation can be done on the anvil of technological 
                  growth and development. We leverage all our activities through the use of 
                  existing technology and find ways to upgrade the same with time. We believe 
                  that education and technology are 2 prime fundamental rights that every 
                  citizen deserves to have.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Values Section -->
      <div class="row justify-content-center mt-5">
        <div class="col-12 col-lg-10">
          <div class="row g-4">
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm text-center">
                <div class="card-body p-4">
                  <div class="icon-circle bg-dark bg-opacity-10 mx-auto mb-3">
                    <i class="bi bi-people-fill text-dark"></i>
                  </div>
                  <h5 class="fw-bold">Social Transformation</h5>
                  <p class="text-muted">Empowering communities through digital intervention and social change.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm text-center">
                <div class="card-body p-4">
                  <div class="icon-circle bg-dark bg-opacity-10 mx-auto mb-3">
                    <i class="bi bi-laptop text-dark"></i>
                  </div>
                  <h5 class="fw-bold">Technology Access</h5>
                  <p class="text-muted">Leveraging technology to bridge the digital divide and create opportunities.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm text-center">
                <div class="card-body p-4">
                  <div class="icon-circle bg-dark bg-opacity-10 mx-auto mb-3">
                    <i class="bi bi-mortarboard-fill text-dark"></i>
                  </div>
                  <h5 class="fw-bold">Education for All</h5>
                  <p class="text-muted">Making quality education accessible to every citizen as a fundamental right.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Methods
const scrollToAbout = () => {
  const element = document.getElementById('about-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.foundation-home {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: calc(100vh - 76px);
}

.hero-section {
  padding: 4rem 0;
}

.hero-actions .btn {
  min-width: 150px;
  transition: all 0.3s ease;
}

.hero-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-indicator {
  animation: fadeInUp 1s ease-out 0.5s both;
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.about-section {
  padding: 2rem 0;
}

.card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.text-justify {
  text-align: justify;
}

.lead {
  font-size: 1.1rem;
  font-weight: 400;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 0;
  }
  
  .display-4 {
    font-size: 2rem;
  }
  
  .hero-actions .btn {
    min-width: 120px;
    margin-bottom: 0.5rem;
  }
  
  .icon-circle {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .hero-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .hero-actions .btn {
    width: 100%;
    max-width: 200px;
  }
}
</style> 
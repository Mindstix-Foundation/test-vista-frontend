<template>
  <!-- Mobile: container-fluid with responsive padding, Desktop: container -->
  <div class="container-fluid container-md mt-4 mb-5 px-3 px-md-4">
    <!-- Header Section - Mobile Responsive -->
    <div class="row g-2 mb-3">
      <!-- Mobile: Stack vertically, Desktop: Side by side -->
      <div class="col-12">
                <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
          <div class="header-title-section flex-grow-1">
            <h5 class="m-0 fw-bolder text-uppercase mobile-title">assign online test</h5>
        </div>

          <!-- Desktop button - visible only on sm and up -->
          <div class="header-button-section flex-shrink-0 align-self-end align-self-sm-center d-none d-sm-flex">
            <router-link to="/teacher/assign-test/create" class="btn btn-dark btn-create-desktop">
              <i class="bi bi-plus-circle me-2"></i>
              Create Test Paper
          </router-link>
        </div>
      </div>
        <hr class="mobile-hr">
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="row justify-content-center">
      <div class="col-12 col-lg-11 col-xl-10">
        <!-- Search and Sorting Controls - Mobile Responsive -->
        <div class="row mb-4 g-3">
          <!-- Search Container - Mobile: Full width, Desktop: 8 columns -->
          <div class="col-12 col-md-8">
            <div class="search-container-mobile">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control search-input-mobile" 
                placeholder="Search by Name, Subject, Standard, Marks"
                @input="searchTestPapers"
              >
              <i v-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="clearSearch"></i>
            </div>
          </div>

          <!-- Sort Select - Mobile: Full width, Desktop: 4 columns -->
          <div class="col-12 col-md-4">
            <div class="sort-field-mobile">
              <select 
                v-model="sortOption" 
                class="form-select sort-select-mobile" 
                @change="sortTestPapers"
              >
                <option value="name-asc">Sort by Name (A-Z)</option>
                <option value="name-desc">Sort by Name (Z-A)</option>
                <option value="date-asc">Sort by Date (Oldest First)</option>
                <option value="date-desc">Sort by Date (Newest First)</option>
                <option value="marks-asc">Sort by Marks (Low to High)</option>
                <option value="marks-desc">Sort by Marks (High to Low)</option>
              </select>
              <i class="bi bi-filter sort-icon"></i>
            </div>
          </div>
        </div>

        <!-- Test Papers Cards - Mobile Responsive -->
        <div id="testPaperCards">
          <!-- Loading indicator -->
          <div v-if="isLoading" class="text-center my-5">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading test papers...</p>
          </div>

          <!-- Display filtered test papers -->
          <div 
            v-else-if="filteredTestPapers.length > 0"
            v-for="(paper, index) in filteredTestPapers" 
            :key="paper.id"
            class="mb-4"
          >
            <div class="card test-paper-card-mobile shadow-sm">
              <div class="card-body">
                <!-- Mobile Layout -->
                <div class="d-md-none mobile-card-layout">
                  <!-- Mobile Header -->
                  <div class="mobile-card-header mb-3">
                    <h5 class="card-title mb-2 mobile-card-title">
                      {{ paper.name }}
                    </h5>
                    <!-- Mobile Summary Info - 2 columns -->
                    <div class="row g-2 mobile-summary-row">
                      <div class="col-6">
                        <div class="mobile-summary-item">
                          <i class="bi bi-book text-primary me-1"></i>
                          <span class="mobile-summary-label">Subject:</span>
                          <div class="mobile-summary-value">{{ formatSubject(paper) }}</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="mobile-summary-item">
                          <i class="bi bi-mortarboard text-primary me-1"></i>
                          <span class="mobile-summary-label">Standard:</span>
                          <div class="mobile-summary-value">{{ formatStandard(paper) }}</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="mobile-summary-item">
                          <i class="bi bi-award text-success me-1"></i>
                          <span class="mobile-summary-label">Marks:</span>
                          <div class="mobile-summary-value">{{ paper.pattern.total_marks }}</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="mobile-summary-item">
                          <i class="bi bi-clock text-info me-1"></i>
                          <span class="mobile-summary-label">Duration:</span>
                          <div class="mobile-summary-value">{{ paper.duration_minutes }}m</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Mobile Additional Details - Always Visible -->
                  <div class="mobile-details-section-seamless">
                    <div class="mobile-details-content-seamless">
                      <div class="row g-2">
                        <div class="col-6">
                          <div class="mobile-detail-item">
                            <span class="mobile-detail-label">Questions:</span>
                            <span class="mobile-detail-value">{{ paper.question_count }}</span>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="mobile-detail-item">
                            <span class="mobile-detail-label">Per Question:</span>
                            <span class="mobile-detail-value">{{ paper.marks_per_question }}</span>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="mobile-detail-item">
                            <span class="mobile-detail-label">Negative:</span>
                            <span class="mobile-detail-value">{{ paper.negative_marking ? 'Yes' : 'No' }}</span>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="mobile-detail-item">
                            <span class="mobile-detail-label">Medium:</span>
                            <span class="mobile-detail-value">
                              <span v-for="(medium, idx) in formatMediums(paper)" :key="idx">{{ medium }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Mobile Action Buttons -->
                  <div class="mobile-actions-section mt-3">
                    <div class="row g-2">
                      <div class="col-6">
                        <button 
                          @click="assignToStudents(paper)" 
                          class="btn btn-primary mobile-action-btn w-100"
                        >
                          <i class="bi bi-person-plus me-1"></i>
                          <span class="d-none d-sm-inline">Assign Students</span>
                          <span class="d-sm-none">Assign</span>
                        </button>
                      </div>
                      <div class="col-6">
                        <button 
                          @click="viewQuestions(paper)" 
                          class="btn btn-outline-dark mobile-action-btn w-100"
                        >
                          <i class="bi bi-eye me-1"></i>
                          <span class="d-none d-sm-inline">View Questions</span>
                          <span class="d-sm-none">Questions</span>
                        </button>
                      </div>
                      <div class="col-6">
                        <button 
                          @click="viewResults(paper)" 
                          class="btn btn-outline-success mobile-action-btn w-100"
                        >
                          <i class="bi bi-bar-chart me-1"></i>
                          <span class="d-none d-sm-inline">Results</span>
                          <span class="d-sm-none">Results</span>
                        </button>
                      </div>
                      <div class="col-6">
                        <button 
                          @click="deleteTestPaper(paper)" 
                          class="btn btn-outline-danger mobile-action-btn w-100"
                        >
                          <i class="bi bi-trash me-1"></i>
                          <span class="d-none d-sm-inline">Delete</span>
                          <span class="d-sm-none">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Desktop Layout (unchanged) -->
                <div class="d-none d-md-block desktop-card-layout">
                <div class="row">
                  <!-- Paper Details -->
                  <div class="col-md-8">
                    <h5 class="card-title mb-3">
                      {{ paper.name }}
                    </h5>
                    
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <div class="paper-info-item">
                          <i class="bi bi-book text-dark me-2"></i>
                          <span class="fw-medium">Subject: <span class="fw-bold">{{ formatSubject(paper) }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-mortarboard text-dark me-2"></i>
                          <span class="fw-medium">Standard: <span class="fw-bold">{{ formatStandard(paper) }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-award text-dark me-2"></i>
                          <span class="fw-medium">Total Marks: <span class="fw-bold">{{ paper.pattern.total_marks }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-calculator text-dark me-2"></i>
                          <span class="fw-medium">Marks per Question: <span class="fw-bold">{{ paper.marks_per_question }}</span></span>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="paper-info-item">
                          <i class="bi bi-exclamation-triangle text-dark me-2"></i>
                          <span class="fw-medium">Negative Marking: <span class="fw-bold">{{ paper.negative_marking ? 'Yes' : 'No' }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-translate text-dark me-2"></i>
                          <span class="fw-medium">Mediums: 
                            <span v-for="(medium, idx) in formatMediums(paper)" :key="idx" class="fw-bold">{{ medium }}</span>
                          </span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-question-circle text-dark me-2"></i>
                          <span class="fw-medium">Total Questions: <span class="fw-bold">{{ paper.question_count }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-clock text-dark me-2"></i>
                          <span class="fw-medium">Duration: <span class="fw-bold">{{ paper.duration_minutes }} minutes</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Actions Section -->
                  <div class="col-md-4 d-flex flex-column justify-content-center align-items-md-end gap-2">
                    <button 
                      @click="assignToStudents(paper)" 
                      class="btn btn-primary action-btn w-100"
                    >
                      <i class="bi bi-person-plus me-2"></i>Assign to Students
                    </button>
                    <button 
                      @click="viewQuestions(paper)" 
                      class="btn btn-outline-dark action-btn w-100"
                    >
                      <i class="bi bi-eye me-2"></i>View Questions
                    </button>
                    <button 
                      @click="viewResults(paper)" 
                      class="btn btn-outline-success action-btn w-100"
                    >
                      <i class="bi bi-bar-chart me-2"></i>Result Dashboard
                    </button>
                    <button 
                      @click="deleteTestPaper(paper)" 
                      class="btn btn-outline-danger action-btn w-100"
                    >
                      <i class="bi bi-trash me-2"></i>Delete
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-else-if="!isLoading && filteredTestPapers.length === 0" class="text-center mt-4">
            <div class="empty-state">
              <i class="bi bi-file-earmark-x display-1 text-muted"></i>
              <p class="mt-3 text-muted">No test papers found. Try adjusting your search or create a new test paper.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Confirm Delete</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete the test paper "{{ selectedPaper?.name }}"? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Students Modal - Mobile Responsive -->
    <div class="modal fade" id="assignModal" tabindex="-1" aria-labelledby="assignModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-mobile-responsive">
        <div class="modal-content modal-content-mobile">
          <div class="modal-header modal-header-mobile">
            <h5 class="modal-title mobile-modal-title" id="assignModalLabel">
              <span class="d-none d-sm-inline">Assign Test Paper: {{ selectedPaper?.name }}</span>
              <span class="d-sm-none">Assign Test</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body modal-body-mobile">
            <!-- Test Assignment Form - Mobile Responsive -->
            <div class="row mb-3 g-3">
              <!-- Mobile: Stack vertically, Desktop: Side by side -->
              <div class="col-12 col-md-6">
                <label for="dueDate" class="form-label mobile-form-label">Due Date *</label>
                <div class="custom-date-picker">
                  <input 
                    type="text" 
                    class="form-control date-input-modern" 
                    id="dueDate" 
                    v-model="formattedDueDate"
                    placeholder="DD-MM-YYYY"
                    @click="showDueDatePicker = true"
                    @focus="showDueDatePicker = true"
                    readonly
                    required
                  >
                  <i class="bi bi-calendar3 date-icon"></i>
                  
                  <!-- Custom Date Picker Dropdown -->
                  <div v-if="showDueDatePicker" class="date-picker-dropdown">
                    <div class="date-picker-header">
                      <button @click="previousMonth('due')" class="nav-btn">&lt;</button>
                      <span class="month-year">{{ currentMonthYear('due') }}</span>
                      <button @click="nextMonth('due')" class="nav-btn">&gt;</button>
                    </div>
                    <div class="date-picker-calendar">
                      <div class="weekdays">
                        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                      </div>
                      <div class="dates">
                        <button 
                          v-for="date in getCalendarDates('due')" 
                          :key="date.key"
                          @click="selectDate('due', date)"
                          class="date-btn"
                          :class="{
                            'other-month': date.otherMonth,
                            'selected': date.selected,
                            'today': date.today
                          }"
                          :disabled="date.otherMonth"
                        >
                          {{ date.day }}
                        </button>
                      </div>
                    </div>
                    <div class="date-picker-footer">
                      <button @click="clearDate('due')" class="btn btn-sm btn-outline-secondary">Clear</button>
                      <button @click="selectToday('due')" class="btn btn-sm btn-outline-primary">Today</button>
                    </div>
                  </div>
                </div>
                <small class="form-text text-muted mobile-help-text">Format: DD-MM-YYYY</small>
              </div>
              <div class="col-12 col-md-6">
                <label for="availableFrom" class="form-label mobile-form-label">Available From *</label>
                <div class="custom-datetime-picker">
                  <input 
                    type="text" 
                    class="form-control datetime-input-modern" 
                    id="availableFrom" 
                    v-model="formattedAvailableFrom"
                    placeholder="DD-MM-YYYY HH:MM"
                    @click="showAvailablePicker = true"
                    @focus="showAvailablePicker = true"
                    readonly
                    required
                  >
                  <i class="bi bi-calendar-event date-icon"></i>
                  
                  <!-- Custom DateTime Picker Dropdown -->
                  <div v-if="showAvailablePicker" class="date-picker-dropdown datetime-dropdown">
                    <div class="date-picker-header">
                      <button @click="previousMonth('available')" class="nav-btn">&lt;</button>
                      <span class="month-year">{{ currentMonthYear('available') }}</span>
                      <button @click="nextMonth('available')" class="nav-btn">&gt;</button>
                    </div>
                    <div class="date-picker-calendar">
                      <div class="weekdays">
                        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                      </div>
                      <div class="dates">
                        <button 
                          v-for="date in getCalendarDates('available')" 
                          :key="date.key"
                          @click="selectDate('available', date)"
                          class="date-btn"
                          :class="{
                            'other-month': date.otherMonth,
                            'selected': date.selected,
                            'today': date.today
                          }"
                          :disabled="date.otherMonth"
                        >
                          {{ date.day }}
                        </button>
                      </div>
                    </div>
                                          <div class="time-picker-section">
                        <div class="time-picker-header">Select Time</div>
                        <div class="time-inputs">
                          <div class="time-input-group">
                            <input 
                              type="number" 
                              v-model="displayHour" 
                              min="1" 
                              max="12" 
                              class="time-input"
                              placeholder="HH"
                              @input="updateDisplayTime"
                            >
                            <label>Hour</label>
                          </div>
                          <span class="time-separator">:</span>
                          <div class="time-input-group">
                            <input 
                              type="number" 
                              v-model="availableTime.minute" 
                              min="0" 
                              max="59" 
                              class="time-input"
                              placeholder="MM"
                              @input="updateAvailableTime"
                            >
                            <label>Minute</label>
                          </div>
                          <div class="ampm-toggle">
                            <button 
                              @click="toggleAMPM('AM')" 
                              class="ampm-btn"
                              :class="{ active: availableTime.ampm === 'AM' }"
                            >
                              AM
                            </button>
                            <button 
                              @click="toggleAMPM('PM')" 
                              class="ampm-btn"
                              :class="{ active: availableTime.ampm === 'PM' }"
                            >
                              PM
                            </button>
                          </div>
                        </div>
                        <div class="quick-time-buttons">
                          <button @click="setQuickTime12('9:00 AM')" class="btn btn-sm btn-outline-secondary">9:00 AM</button>
                          <button @click="setQuickTime12('12:00 PM')" class="btn btn-sm btn-outline-secondary">12:00 PM</button>
                          <button @click="setQuickTime12('3:00 PM')" class="btn btn-sm btn-outline-secondary">3:00 PM</button>
                          <button @click="setQuickTime12('6:00 PM')" class="btn btn-sm btn-outline-secondary">6:00 PM</button>
                        </div>
                      </div>
                    <div class="date-picker-footer">
                      <button @click="clearDate('available')" class="btn btn-sm btn-outline-secondary">Clear</button>
                      <button @click="selectToday('available')" class="btn btn-sm btn-outline-primary">Today</button>
                    </div>
                  </div>
                </div>
                <small class="form-text text-muted mobile-help-text">Format: DD-MM-YYYY HH:MM</small>
              </div>
            </div>
            
            <div class="row mb-3 g-3">
              <div class="col-12 col-md-6">
                <label for="maxAttempts" class="form-label mobile-form-label">Max Attempts</label>
                <input type="number" class="form-control mobile-form-control" id="maxAttempts" v-model="assignmentData.maxAttempts" min="1" max="10">
              </div>
              <div class="col-12 col-md-6">
                <label for="timeLimitMinutes" class="form-label mobile-form-label">Time Limit (Minutes)</label>
                <input type="number" class="form-control mobile-form-control" id="timeLimitMinutes" v-model="assignmentData.timeLimitMinutes" min="1">
                <small class="form-text text-muted mobile-help-text">Leave empty to use test paper's default time limit</small>
              </div>
            </div>

            <!-- Student Filter Toggle - Mobile Responsive -->
            <div class="mb-3">
              <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
                <label class="form-label mb-0 fw-semibold mobile-students-label">
                  Select Students 
                  <span v-if="!loadingStudents" class="text-muted small mobile-student-count">({{ filteredStudents.length }} {{ assignedOnlyToggle ? 'assigned' : 'available' }})</span>
                </label>
                
                <!-- Student Filter Toggle - Mobile: Below label, Desktop: Right side -->
                <div class="d-flex align-items-center mobile-filter-toggle">
                  <span class="me-2 small text-muted d-none d-sm-inline">Show:</span>
                  <div class="form-check form-switch">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="assignedOnlyToggle" 
                      v-model="assignedOnlyToggle" 
                      @change="filterStudents"
                    >
                    <label class="form-check-label ms-2 fw-semibold toggle-label-mobile" for="assignedOnlyToggle">
                      {{ assignedOnlyToggle ? 'Assigned' : 'Non-Assigned' }}
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Mobile Responsive Students Container -->
              <div class="students-container-mobile">
                <!-- Loading indicator -->
                <div v-if="loadingStudents" class="students-loading-mobile">
                  <div class="text-center">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 mb-0 text-muted small">Loading ITI students...</p>
                  </div>
                </div>
                
                <!-- Student selection - Mobile Responsive -->
                <div v-else-if="filteredStudents.length > 0" class="students-content-mobile">
                  <div class="form-check select-all-container-mobile">
                    <input class="form-check-input" type="checkbox" id="selectAllStudents" v-model="selectAllStudents" @change="toggleAllStudents">
                    <label class="form-check-label fw-semibold mobile-select-all-label" for="selectAllStudents">
                      <span class="d-none d-sm-inline">Select All Visible Students ({{ filteredStudents.length }})</span>
                      <span class="d-sm-none">Select All ({{ filteredStudents.length }})</span>
                    </label>
                  </div>
                  <hr class="my-2">
                  <div class="student-list-mobile">
                    <div v-for="student in filteredStudents" :key="student.id" class="student-item-mobile">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" :id="`student-${student.id}`" v-model="student.selected">
                        <label class="form-check-label" :for="`student-${student.id}`">
                          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center w-100 gap-2">
                            <div class="student-info-mobile">
                              <span class="student-name-mobile">{{ student.name }}</span>
                              <span class="student-roll-mobile text-muted d-block d-sm-inline">({{ student.rollNumber }})</span>
                            </div>
                            <div class="student-actions-mobile d-flex align-items-center gap-2">
                              <span v-if="student.isAssigned" class="badge bg-success mobile-badge">Assigned</span>
                              <span v-else class="badge bg-secondary mobile-badge">Not Assigned</span>
                              <!-- Remove assignment button for assigned students -->
                              <button 
                                v-if="student.isAssigned" 
                                @click="removeAssignment(student)"
                                class="btn btn-sm btn-outline-danger mobile-remove-btn"
                                :disabled="removingAssignment"
                                title="Remove Assignment"
                              >
                                <i class="bi bi-x-circle"></i>
                              </button>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- No students message - Mobile Responsive -->
                <div v-else class="students-empty-mobile">
                  <div class="text-center">
                    <i class="bi bi-person-x display-6 text-muted mb-3"></i>
                    <h6 class="text-muted mb-2 mobile-empty-title">
                      {{ assignedOnlyToggle ? 'No assigned students found for this test.' : 'No non-assigned students found for this test.' }}
                    </h6>
                    <p class="text-muted small mb-0 mobile-empty-text">
                      Students need to request enrollment and be approved by you before they can be assigned tests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer modal-footer-mobile">
            <div class="d-flex flex-column flex-sm-row gap-2 w-100">
              <button type="button" class="btn btn-secondary mobile-modal-btn order-2 order-sm-1" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
                class="btn btn-primary mobile-modal-btn order-1 order-sm-2" 
              @click="confirmAssignment"
              :disabled="loadingStudents || filteredStudents.length === 0 || assigningTest || !hasSelectedStudents"
            >
              <span v-if="assigningTest" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-person-plus me-2"></i>
                <span class="d-none d-sm-inline">{{ assigningTest ? 'Assigning...' : 'Assign Test' }}</span>
                <span class="d-sm-none">{{ assigningTest ? 'Assigning...' : 'Assign' }}</span>
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Questions Modal - Mobile Responsive -->
    <div class="modal fade" id="questionsModal" tabindex="-1" aria-labelledby="questionsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-questions-mobile">
        <div class="modal-content modal-content-questions">
          <div class="modal-header modal-header-questions">
            <h5 class="modal-title mobile-questions-title" id="questionsModalLabel">
              <span class="d-none d-sm-inline">Test Questions</span>
              <span class="d-sm-none">Questions</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body modal-body-questions">
            <!-- Loading indicator -->
            <div v-if="loadingQuestions" class="text-center my-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3">Loading questions...</p>
            </div>

            <!-- Display questions -->
            <div v-else-if="currentQuestions">
              <div class="test-paper-info-mobile mb-4">
                <h6 class="text-primary mobile-paper-title">{{ currentQuestions.test_paper.name }}</h6>
                <!-- Mobile: Stack info vertically, Desktop: 3 columns -->
                <div class="d-none d-md-block">
                <div class="row">
                  <div class="col-md-4">
                    <small class="text-muted">Total Questions: {{ currentQuestions.test_paper.total_questions }}</small>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Total Marks: {{ currentQuestions.test_paper.total_marks }}</small>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Duration: {{ currentQuestions.test_paper.duration_minutes }} mins</small>
                    </div>
                  </div>
                </div>
                <!-- Mobile Layout -->
                <div class="d-md-none mobile-paper-info">
                  <div class="row g-2">
                    <div class="col-4">
                      <div class="mobile-info-item">
                        <i class="bi bi-question-circle text-primary me-1"></i>
                        <div class="mobile-info-value">{{ currentQuestions.test_paper.total_questions }}</div>
                        <div class="mobile-info-label">Questions</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="mobile-info-item">
                        <i class="bi bi-award text-success me-1"></i>
                        <div class="mobile-info-value">{{ currentQuestions.test_paper.total_marks }}</div>
                        <div class="mobile-info-label">Marks</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="mobile-info-item">
                        <i class="bi bi-clock text-info me-1"></i>
                        <div class="mobile-info-value">{{ currentQuestions.test_paper.duration_minutes }}m</div>
                        <div class="mobile-info-label">Duration</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="questions-container">
                <div 
                  v-for="(question, questionIndex) in getAllQuestionsFlat()" 
                  :key="question.id"
                  class="question-item"
                >
                  <div class="question-wrapper">
                    <div class="d-flex w-100">
                      <!-- Question Content -->
                      <div class="question-content">
                        <div class="question-text">
                          {{ questionIndex + 1 }}. {{ question.question_text }}
                          <span v-if="question.chapter" class="chapter-badge">
                            {{ question.chapter.name }}
                          </span>
                        </div>
                        
                        <!-- MCQ Options -->
                        <div v-if="question.mcq_options && question.mcq_options.length > 0" class="options-container">
                          <div class="options-column">
                            <div 
                              v-for="(option, optionIndex) in question.mcq_options" 
                              :key="option.id"
                              class="option-item-column"
                              :class="{ 'correct-option': option.is_correct }"
                            >
                              <div class="option-prefix">
                                <i v-if="option.is_correct" class="bi bi-check-circle-fill correct-tick"></i>
                                <span v-else class="tick-placeholder"></span>
                              </div>
                              <span class="option-label">{{ getOptionLabel(optionIndex) }})</span>
                              <span class="option-text">{{ option.option_text }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div v-else class="text-muted">
                          <i class="bi bi-info-circle me-1"></i>
                          No options available for this question
                        </div>
                      </div>
                      
                      <!-- Marks -->
                      <div class="question-marks">
                        <div class="marks-row">
                          <span class="marks fw-bold">{{ question.marks }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr class="question-divider" />
                </div>
                
                <div v-if="getAllQuestionsFlat().length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-question-circle me-2"></i>
                  No questions available in this test paper
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer modal-footer-questions">
            <button type="button" class="btn btn-secondary mobile-close-btn w-100 w-sm-auto" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Fixed Bottom Button - Full width -->
    <div class="mobile-bottom-button-container d-sm-none">
      <router-link to="/teacher/assign-test/create" class="btn mobile-bottom-button">
        <i class="bi bi-plus-circle me-2"></i>
        Create Test Paper
      </router-link>
    </div>

    <!-- Toast Notification Component -->
    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/stores/toast'
import ToastNotification from '@/components/common/ToastNotification.vue'

const router = useRouter()
const toastStore = useToastStore()

// Define interfaces for type safety
interface TestPaper {
  id: number
  name: string
  marks_per_question: number
  question_count: number
  duration_minutes: number
  instructions: string
  negative_marking: boolean
  negative_marks_per_question: number
  randomize_questions: boolean
  randomize_options: boolean
  is_online: boolean
  created_at: string
  pattern: {
    id: number
    pattern_name: string
    total_marks: number
    standard: {
      id: number
      name: string
    }
    subject: {
      id: number
      name: string
    }
    sections: Array<{
      id: number
      marks_per_question: number
    }>
  }
  chapters: Array<{
    id: number
    name: string
  }>
  school: {
    id: number
    name: string
  }
}

interface QuestionOption {
  id: number
  option_text: string
  is_correct: boolean
  image?: {
    id: number
    image_url: string
    original_filename: string
  } | null
}

interface Question {
  id: number
  question_id: number
  question_text_id: number
  question_order: number
  marks: number
  is_mandatory: boolean
  question_type: {
    id: number
    type_name: string
  }
  question_text: string
  question_image?: {
    id: number
    image_url: string
    original_filename: string
  } | null
  chapter: {
    id: number
    name: string
  }
  topic: {
    id: number
    name: string
  }
  mcq_options: QuestionOption[]
  match_pairs: any[]
}

interface QuestionSubsection {
  id: number
  sequential_number: number
  question_type: {
    id: number
    type_name: string
  }
  questions: Question[]
}

interface QuestionSection {
  id: number
  section_name: string
  sequence_number: number
  section_number: number
  sub_section: string
  total_questions: number
  mandotory_questions: number
  marks_per_question: number
  subsections: QuestionSubsection[]
}

interface TestPaperQuestions {
  test_paper: {
    id: number
    name: string
    duration_minutes: number
    instructions: string
    negative_marking: boolean
    negative_marks_per_question: number
    randomize_questions: boolean
    randomize_options: boolean
    pattern: {
      id: number
      pattern_name: string
      total_marks: number
      standard: {
        id: number
        name: string
      }
      subject: {
        id: number
        name: string
      }
    }
    school: {
      id: number
      name: string
    }
    total_questions: number
    total_marks: number
  }
  sections: QuestionSection[]
}

interface Student {
  id: number
  name: string
  rollNumber: string
  selected: boolean
  isAssigned?: boolean
}

// New reactive variables for filtering and assignment management
const assignedOnlyToggle = ref(false) // boolean: false = all students, true = assigned only
const assigningTest = ref(false)
const removingAssignment = ref(false)

// Date picker reactive variables
const showDueDatePicker = ref(false)
const showAvailablePicker = ref(false)
const dueDatePicker = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})
const availableDatePicker = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})
const availableTime = ref({
  hour: 9,
  minute: 0,
  ampm: 'AM' as 'AM' | 'PM'
})

// Calendar configuration
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Reactive variables
const testPapers = ref<TestPaper[]>([])
const filteredTestPapers = computed(() => {
  let filtered = testPapers.value

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(paper => 
      paper.name.toLowerCase().includes(query) ||
      formatSubject(paper).toLowerCase().includes(query) ||
      formatStandard(paper).toLowerCase().includes(query) ||
      paper.pattern.total_marks.toString().includes(query)
    )
  }

  // Apply sorting
  if (sortOption.value) {
    const [field, direction] = sortOption.value.split('-')
    filtered = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'marks':
          aValue = a.pattern.total_marks
          bValue = b.pattern.total_marks
          break
        default:
          return 0
      }
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  return filtered
})

const isLoading = ref(false)
const searchQuery = ref('')
const sortOption = ref('date-desc')

// Modal and assignment related variables
const selectedPaper = ref<TestPaper | null>(null)
const students = ref<Student[]>([])
const filteredStudents = computed(() => {
  // Backend already filters based on assigned_only parameter
  // So we just return all students from the API response
  return students.value
})

const loadingStudents = ref(false)
const selectAllStudents = ref(false)
const assignmentData = ref({
  dueDate: '',
  availableFrom: '',
  maxAttempts: 1,
  timeLimitMinutes: null as number | null
})

// Questions modal variables
const currentQuestions = ref<any>(null)
const loadingQuestions = ref(false)

// Computed properties
const showQuestionsModal = ref(false)

const hasSelectedStudents = computed(() => {
  return filteredStudents.value.some(student => student.selected)
})

// Date formatting computed properties
const formattedDueDate = computed({
  get: () => {
    if (!assignmentData.value.dueDate) return ''
    const date = new Date(assignmentData.value.dueDate)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  },
  set: (value: string) => {
    // This will be handled by the date picker
  }
})

const formattedAvailableFrom = computed({
  get: () => {
    if (!assignmentData.value.availableFrom) return ''
    const date = new Date(assignmentData.value.availableFrom)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    // Convert to 12-hour format
    let hour = date.getHours()
    const minute = date.getMinutes().toString().padStart(2, '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12
    if (hour === 0) hour = 12
    
    return `${day}-${month}-${year} ${hour}:${minute} ${ampm}`
  },
  set: (value: string) => {
    // This will be handled by the date picker
  }
})

// Display hour computed property for 12-hour format
const displayHour = computed({
  get: () => {
    let hour = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && hour !== 12) hour += 12
    if (availableTime.value.ampm === 'AM' && hour === 12) hour = 0
    
    // Convert back to 12-hour display
    const displayHour = hour % 12
    return displayHour === 0 ? 12 : displayHour
  },
  set: (value: number) => {
    // Convert 12-hour to 24-hour and update
    let hour24 = value
    if (availableTime.value.ampm === 'PM' && value !== 12) {
      hour24 = value + 12
    } else if (availableTime.value.ampm === 'AM' && value === 12) {
      hour24 = 0
    }
    availableTime.value.hour = hour24
    updateAvailableTime()
  }
})

// Toast helper functions
const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  toastStore.showToast({ title, message, type })
}

// API Methods
const fetchOnlineTestPapers = async () => {
  try {
    isLoading.value = true
    const response = await axiosInstance.get('/create-test-paper/online')
    
    if (response.data && Array.isArray(response.data)) {
      testPapers.value = response.data
      console.log('Fetched online test papers:', response.data)
    } else {
      console.warn('Unexpected API response format:', response.data)
      testPapers.value = []
    }
  } catch (error: any) {
    console.error('Error fetching online test papers:', error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('User not authenticated')
      // Optionally redirect to login
    } else if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data?.message)
    } else {
      console.error('Failed to fetch test papers')
    }
    
    testPapers.value = []
  } finally {
    isLoading.value = false
  }
}

// Helper functions to format data for display
const formatSubject = (paper: TestPaper) => {
  // Use the pattern's subject information
  if (paper.pattern?.subject) {
    return paper.pattern.subject.name
  }
  // Fallback to pattern name
  return paper.pattern?.pattern_name || paper.name
}

const formatStandard = (paper: TestPaper) => {
  // Use the pattern's standard information
  if (paper.pattern?.standard) {
    return paper.pattern.standard.name
  }
  // Fallback to pattern name
  return paper.pattern?.pattern_name || paper.name
}

const formatMediums = (paper: TestPaper) => {
  // This would come from the API in a real implementation
  // For now, return a default value
  return ['English'] // Placeholder
}

// Methods
const searchTestPapers = () => {
  // Search is handled by computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const sortTestPapers = () => {
  // Sorting is handled by computed property
}

const assignToStudents = async (paper: TestPaper) => {
  // Store test paper data temporarily in sessionStorage
  sessionStorage.setItem(`testPaper_${paper.id}`, JSON.stringify(paper))
  
  // Navigate to dedicated assignment page
  router.push({
    name: 'assignToStudents',
    params: { testPaperId: paper.id.toString() }
  })
}

// API method to load ITI students instead of enrolled students
const loadEnrolledStudents = async (paper: TestPaper) => {
  try {
    loadingStudents.value = true
    console.log('Loading ITI students for paper:', paper.name)
    
    // Use ITI students API instead of enrolled students API
    const response = await axiosInstance.get('/iti-mocktest/students', {
      params: {
        schoolId: paper.school.id,  // Use school from test paper
        standardId: paper.pattern.standard.id  // Use standard from test paper pattern
      }
    })
    
    console.log('API Response - ITI Students found:', response.data?.data?.length || 0)
    
    if (response.data && response.data.statusCode === 200 && Array.isArray(response.data.data)) {
      // Get existing assignments for this paper to determine assignment status
      let assignedStudentIds = new Set<number>()
      
      if (paper.id) {
        try {
          const assignmentsResponse = await axiosInstance.get('/test-assignments', {
            params: {
              test_paper_id: paper.id
            }
          })
          
          if (assignmentsResponse.data && Array.isArray(assignmentsResponse.data)) {
            assignedStudentIds = new Set(assignmentsResponse.data.map((a: any) => a.student_id))
          }
        } catch (assignmentError) {
          console.warn('Could not fetch existing assignments:', assignmentError)
        }
      }
      
      // Transform ITI students API response to match Student interface
      students.value = response.data.data.map((itiStudent: any) => ({
        id: itiStudent.id,  // Use ITI student ID
        name: itiStudent.user.name,
        rollNumber: itiStudent.student_id,  // ITI student roll number
        selected: false,
        isAssigned: assignedStudentIds.has(itiStudent.id)
      }))
      
      // Filter based on assignedOnlyToggle if needed
      if (assignedOnlyToggle.value === true) {
        // Show only assigned students
        students.value = students.value.filter(student => student.isAssigned)
      } else if (assignedOnlyToggle.value === false) {
        // Show only unassigned students  
        students.value = students.value.filter(student => !student.isAssigned)
      }
      // If undefined, show all students with assignment status
      
      console.log('Loaded ITI students:', students.value.length)
    } else {
      console.warn('Unexpected API response format:', response.data)
      students.value = []
    }
  } catch (error: any) {
    console.error('Error loading ITI students:', error)
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('No ITI students found for this standard and school')
      students.value = []
    } else if (error.response?.status === 401) {
      console.error('User not authenticated')
    } else {
      console.error('Failed to load ITI students')
      students.value = []
    }
  } finally {
    loadingStudents.value = false
  }
}

const viewQuestions = async (paper: TestPaper) => {
  try {
    loadingQuestions.value = true
    console.log('Fetching questions for test paper:', paper.id)
    
    const response = await axiosInstance.get(`/create-test-paper/online/${paper.id}/questions`)
    currentQuestions.value = response.data
    
    // Show the modal
    const modal = new Modal(document.getElementById('questionsModal')!)
    modal.show()
    
    console.log('Questions loaded:', response.data)
  } catch (error) {
    console.error('Error fetching questions:', error)
    showToast('Error', 'Failed to load questions. Please try again.', 'error')
  } finally {
    loadingQuestions.value = false
  }
}

const viewResults = (paper: TestPaper) => {
  // Navigate to result dashboard with test paper ID
  router.push({
    name: 'testResultDashboard',
    params: { testPaperId: paper.id.toString() }
  })
}

const closeQuestionsModal = () => {
  const modal = Modal.getInstance(document.getElementById('questionsModal')!)
  modal?.hide()
  currentQuestions.value = null
}

// New function to flatten all questions from nested structure
const getAllQuestionsFlat = () => {
  if (!currentQuestions.value || !currentQuestions.value.sections) {
    return []
  }
  
  const allQuestions: Question[] = []
  
  currentQuestions.value.sections.forEach((section: QuestionSection) => {
    section.subsections.forEach((subsection: QuestionSubsection) => {
      subsection.questions.forEach((question: Question) => {
        allQuestions.push(question)
      })
    })
  })
  
  return allQuestions
}

// New function to get option label (A, B, C, D, etc.)
const getOptionLabel = (index: number) => {
  return String.fromCharCode(65 + index) // Returns A, B, C, D, etc.
}

const deleteTestPaper = (paper: TestPaper) => {
  selectedPaper.value = paper
  const modal = new Modal(document.getElementById('deleteModal')!)
  modal.show()
}

const confirmDelete = async () => {
  if (!selectedPaper.value) return

  try {
    console.log('Deleting test paper:', selectedPaper.value.id)
    
    // Call the correct delete API endpoint for online test papers
    await axiosInstance.delete(`/create-test-paper/online/${selectedPaper.value.id}`)
    
    // Remove from local array after successful deletion
    const index = testPapers.value.findIndex(p => p.id === selectedPaper.value!.id)
    if (index > -1) {
      testPapers.value.splice(index, 1)
    }
    
    const modal = Modal.getInstance(document.getElementById('deleteModal')!)
    modal?.hide()
    selectedPaper.value = null
    
    showToast('Success', 'Test paper deleted successfully.', 'success')
  } catch (error: any) {
    console.error('Error deleting test paper:', error)
    
    let errorMessage = 'Failed to delete test paper. Please try again.'
    
    if (error.response?.status === 404) {
      errorMessage = 'Test paper not found or you do not have permission to delete it.'
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.message || 'Cannot delete test paper - it may have active student attempts.'
    }
    
    showToast('Error', errorMessage, 'error')
  }
}

const toggleAllStudents = () => {
  filteredStudents.value.forEach(student => {
    student.selected = selectAllStudents.value
  })
}

const confirmAssignment = async () => {
  if (filteredStudents.value.length === 0) {
    showToast('No Students Available', 'No students are available for assignment.', 'info')
    return
  }
  
  const selectedStudents = filteredStudents.value.filter(s => s.selected)
  if (selectedStudents.length === 0) {
    showToast('No Students Selected', 'Please select at least one student to assign the test.', 'info')
    return
  }
  
  if (!assignmentData.value.dueDate || !assignmentData.value.availableFrom) {
    showToast('Missing Information', 'Please fill in all required fields (Due Date and Available From).', 'warning')
    return
  }

  // Directly execute assignment without confirmation modal
  await executeAssignment(selectedStudents)
}

const executeAssignment = async (selectedStudents: Student[]) => {
  try {
    assigningTest.value = true
    
    const assignmentPayload = {
      test_paper_id: selectedPaper.value!.id,
      student_ids: selectedStudents.map(s => s.id),
      due_date: new Date(assignmentData.value.dueDate).toISOString(),
      available_from: new Date(assignmentData.value.availableFrom).toISOString(),
      max_attempts: assignmentData.value.maxAttempts,
      time_limit_minutes: assignmentData.value.timeLimitMinutes
    }
    
    console.log('Assigning test with payload:', assignmentPayload)
    
    const response = await axiosInstance.post('/test-assignments/bulk', assignmentPayload)
    
    if (response.status === 201) {
      const result = response.data
      
      // Update assignment status for successfully assigned students
      selectedStudents.forEach(student => {
        student.isAssigned = true
        student.selected = false
      })
      
      // Show success message
      let message = `Test assigned successfully to ${result.assigned || selectedStudents.length} student(s)!`
      
      if (result.failed && result.failed.length > 0) {
        message += ` Failed: ${result.failed.length} students.`
      }
      
      showToast('Assignment Successful', message, 'success')
      
      console.log('Assignment completed:', result)
    }
  } catch (error: any) {
    console.error('Error assigning test:', error)
    
    let errorMessage = 'Failed to assign test. Please try again.'
    
    if (error.response?.status === 400) {
      errorMessage = 'Invalid assignment data. Please check your inputs.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Test paper or students not found.'
    }
    
    showToast('Assignment Failed', errorMessage, 'error')
  } finally {
    assigningTest.value = false
  }
  
  // Close modal and reset form
  const modal = Modal.getInstance(document.getElementById('assignModal')!)
  modal?.hide()
  
  // Reset form
  selectAllStudents.value = false
  assignmentData.value = {
    dueDate: '',
    availableFrom: '',
    maxAttempts: 1,
    timeLimitMinutes: null
  }
  selectedPaper.value = null
  assignedOnlyToggle.value = false
}

const filterStudents = async () => {
  console.log('Toggle changed to:', assignedOnlyToggle.value)
  
  // Reset select all when filter changes
  selectAllStudents.value = false
  // Clear all selections when filter changes
  students.value.forEach(student => {
    student.selected = false
  })
  
  // Reload students with new filter if we have a selected paper
  if (selectedPaper.value) {
    await loadEnrolledStudents(selectedPaper.value)
  }
}

const removeAssignment = async (student: Student) => {
  if (!selectedPaper.value) return
  
  // Directly execute removal without confirmation modal
  await executeRemoveAssignment(student)
}

const executeRemoveAssignment = async (student: Student) => {
  try {
    removingAssignment.value = true
    
    const response = await axiosInstance.delete('/test-assignments', {
      data: {
        student_id: student.id,
        test_paper_id: selectedPaper.value!.id
      }
    })
    
    if (response.status === 200) {
      // Update student assignment status
      student.isAssigned = false
      student.selected = false
      
      console.log('Assignment removed successfully for student:', student.name)
      
      // Show success message
      showToast('Assignment Removed', `Test assignment removed successfully for ${student.name}.`, 'success')
    }
  } catch (error: any) {
    console.error('Error removing assignment:', error)
    
    let errorMessage = 'Failed to remove assignment. Please try again.'
    
    if (error.response?.status === 404) {
      errorMessage = 'Assignment not found.'
    } else if (error.response?.status === 400) {
      errorMessage = 'Cannot remove assignment - student may have already started the test.'
    }
    
    showToast('Remove Assignment Failed', errorMessage, 'error')
  } finally {
    removingAssignment.value = false
  }
}

// Date picker methods
const currentMonthYear = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  return `${months[picker.month]} ${picker.year}`
}

const previousMonth = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  if (picker.month === 0) {
    picker.month = 11
    picker.year--
  } else {
    picker.month--
  }
}

const nextMonth = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  if (picker.month === 11) {
    picker.month = 0
    picker.year++
  } else {
    picker.month++
  }
}

const getCalendarDates = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  const firstDay = new Date(picker.year, picker.month, 1)
  const lastDay = new Date(picker.year, picker.month + 1, 0)
  const today = new Date()
  const selectedDate = type === 'due' 
    ? (assignmentData.value.dueDate ? new Date(assignmentData.value.dueDate) : null)
    : (assignmentData.value.availableFrom ? new Date(assignmentData.value.availableFrom) : null)
  
  const dates = []
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    const isSelected = selectedDate && 
      currentDate.getDate() === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    
    const isToday = currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    
    dates.push({
      key: `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`,
      day: currentDate.getDate(),
      date: new Date(currentDate),
      otherMonth: currentDate.getMonth() !== picker.month,
      selected: isSelected,
      today: isToday
    })
  }
  
  return dates
}

const selectDate = (type: 'due' | 'available', dateObj: any) => {
  if (dateObj.otherMonth) return
  
  const selectedDate = new Date(dateObj.date)
  
  if (type === 'due') {
    assignmentData.value.dueDate = selectedDate.toISOString().split('T')[0]
    showDueDatePicker.value = false
  } else {
    // For available from, preserve the selected time
    selectedDate.setHours(availableTime.value.hour, availableTime.value.minute, 0, 0)
    assignmentData.value.availableFrom = selectedDate.toISOString()
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const dueDatePicker = document.querySelector('.custom-date-picker')
  const availablePicker = document.querySelector('.custom-datetime-picker')
  
  if (showDueDatePicker.value && dueDatePicker && !dueDatePicker.contains(target)) {
    showDueDatePicker.value = false
  }
  
  if (showAvailablePicker.value && availablePicker && !availablePicker.contains(target)) {
    showAvailablePicker.value = false
  }
}

const selectToday = (type: 'due' | 'available') => {
  const today = new Date()
  
  if (type === 'due') {
    assignmentData.value.dueDate = today.toISOString().split('T')[0]
    showDueDatePicker.value = false
  } else {
    // Convert 12-hour to 24-hour format
    let hour24 = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && availableTime.value.hour !== 12) {
      hour24 = availableTime.value.hour + 12
    } else if (availableTime.value.ampm === 'AM' && availableTime.value.hour === 12) {
      hour24 = 0
    }
    
    today.setHours(hour24, availableTime.value.minute, 0, 0)
    assignmentData.value.availableFrom = today.toISOString()
  }
}

const clearDate = (type: 'due' | 'available') => {
  if (type === 'due') {
    assignmentData.value.dueDate = ''
    showDueDatePicker.value = false
  } else {
    assignmentData.value.availableFrom = ''
    showAvailablePicker.value = false
  }
}

const updateAvailableTime = () => {
  if (assignmentData.value.availableFrom) {
    const date = new Date(assignmentData.value.availableFrom)
    
    // Convert 12-hour to 24-hour format for storage
    let hour24 = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && availableTime.value.hour !== 12) {
      hour24 = availableTime.value.hour + 12
    } else if (availableTime.value.ampm === 'AM' && availableTime.value.hour === 12) {
      hour24 = 0
    }
    
    date.setHours(hour24, availableTime.value.minute, 0, 0)
    assignmentData.value.availableFrom = date.toISOString()
  }
}

const setQuickTime = (timeStr: string) => {
  const [hour, minute] = timeStr.split(':').map(Number)
  availableTime.value.hour = hour
  availableTime.value.minute = minute
  updateAvailableTime()
}

// New methods for 12-hour time picker
const updateDisplayTime = () => {
  updateAvailableTime()
}

const toggleAMPM = (period: 'AM' | 'PM') => {
  availableTime.value.ampm = period
  updateAvailableTime()
}

const setQuickTime12 = (timeStr: string) => {
  // Parse time like "9:00 AM" or "3:00 PM"
  const [time, period] = timeStr.split(' ')
  const [hour, minute] = time.split(':').map(Number)
  
  // Convert to 24-hour format
  let hour24 = hour
  if (period === 'PM' && hour !== 12) {
    hour24 = hour + 12
  } else if (period === 'AM' && hour === 12) {
    hour24 = 0
  }
  
  availableTime.value.hour = hour24
  availableTime.value.minute = minute
  availableTime.value.ampm = period as 'AM' | 'PM'
  updateAvailableTime()
}



// Lifecycle hooks
onMounted(() => {
  fetchOnlineTestPapers()
  // Add click outside listener for date pickers
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Search field styling */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #6c757d;
}

.clear-search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #6c757d;
  cursor: pointer;
}

.clear-search-icon:hover {
  color: #212529;
}

input[type="text"] {
  padding-left: 30px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  height: 48px;
}

/* Sort field styling */
.sort-field {
  position: relative;
}

.sort-select {
  height: 48px;
  padding-right: 40px;
  border-radius: 8px;
  appearance: none;
  background-image: none;
  transition: all 0.3s ease;
}

.sort-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 10;
}

/* Questions Modal Styling */
.question-card {
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.question-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.question-number {
  font-size: 0.8rem;
  min-width: 40px;
}

.question-type {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.question-marks {
  font-size: 0.75rem;
}

.question-text {
  font-size: 1rem;
  line-height: 1.5;
  color: #212529;
}

.option-item {
  transition: all 0.2s ease;
  min-height: 50px;
}

.option-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option-label {
  font-size: 0.9rem;
  min-width: 25px;
}

.option-content {
  font-size: 0.9rem;
  line-height: 1.4;
}

.test-paper-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

#questionsModal .modal-dialog {
  max-width: 900px;
}

#questionsModal .modal-body {
  max-height: 70vh;
  overflow-y: auto;
}

.subsection-type {
  margin-bottom: 0.5rem;
}

.subsection-type .badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.chapter-topic-info {
  margin-top: 0.5rem;
}

.chapter-topic-info .badge {
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.match-pairs-container {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

/* Card styling aligned with project design */
.test-paper-card {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.test-paper-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.test-paper-card .card-title {
  color: #212529;
  font-weight: 600;
}

.paper-info-item {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.medium-badge {
  background-color: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #555;
  margin-right: 0.5rem;
}

.action-btn {
  min-width: 180px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  padding: 3rem 1rem;
}

.student-list {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
}

.form-check {
  margin-bottom: 0.5rem;
}

/* ===== MOBILE RESPONSIVE STYLES ===== */

/* Mobile Header Styles */
.mobile-title {
  font-size: 1.25rem;
  line-height: 1.3;
}

.btn-create-desktop {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 6px;
  min-height: 44px;
}

.header-button-section {
  display: flex;
  justify-content: flex-end;
}

/* Mobile Fixed Bottom Button */
.mobile-bottom-button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  background-color: white;
  border-top: 1px solid #e9ecef;
  padding: 12px 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.mobile-bottom-button {
  width: 100%;
  background-color: white;
  color: #212529;
  border: 2px solid #212529;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 600;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
}

.mobile-bottom-button:hover {
  background-color: #212529;
  color: white;
  text-decoration: none;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(33, 37, 41, 0.3);
}

.mobile-bottom-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(33, 37, 41, 0.2);
}

.mobile-bottom-button:active {
  transform: translateY(0);
}

@media (max-width: 575px) {
  .mobile-title {
    font-size: 1.1rem;
  }
  
  .mobile-bottom-button-container {
    padding: 10px 12px;
  }
  
  .mobile-bottom-button {
    font-size: 0.95rem;
    padding: 10px 14px;
    min-height: 44px;
  }
}

.mobile-hr {
  margin: 0.75rem 0;
}

/* Mobile Search and Filter Styles */
.search-container-mobile {
  position: relative;
  width: 100%;
}

.search-input-mobile {
  padding-left: 35px;
  padding-right: 35px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  height: 48px;
  font-size: 1rem;
}

.sort-field-mobile {
  position: relative;
  width: 100%;
}

.sort-select-mobile {
  height: 48px;
  padding-right: 40px;
  border-radius: 8px;
  appearance: none;
  background-image: none;
  font-size: 1rem;
}

@media (max-width: 575px) {
  .search-input-mobile {
    height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .sort-select-mobile {
    height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Mobile Card Styles */
.test-paper-card-mobile {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.test-paper-card-mobile:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.mobile-card-layout {
  padding: 0.5rem;
}

.mobile-card-header {
  border-bottom: 1px solid #f1f3f4;
  padding-bottom: 1rem;
}

.mobile-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

/* Mobile Summary Items */
.mobile-summary-row {
  margin-top: 0.75rem;
}

.mobile-summary-item {
  text-align: center;
  padding: 0.75rem 0.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.mobile-summary-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
}

.mobile-summary-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #212529;
}

/* Mobile Details Section */
.mobile-details-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f3f4;
}



.mobile-details-content {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

/* Mobile Details Section - Seamless (No separators) */
.mobile-details-section-seamless {
  margin-top: 0.75rem;
  padding-top: 0;
  border-top: none;
}

.mobile-details-content-seamless {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  border: none;
}

.mobile-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.mobile-detail-item:last-child {
  border-bottom: none;
}

.mobile-detail-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.mobile-detail-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
}

/* Mobile Action Buttons */
.mobile-actions-section {
  padding-top: 1rem;
  border-top: 1px solid #f1f3f4;
}

.mobile-action-btn {
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  min-height: 44px;
  transition: all 0.3s ease;
  border-width: 2px;
}

.mobile-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

@media (max-width: 575px) {
  .mobile-action-btn {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
}

/* Mobile Modal Styles */
.modal-mobile-responsive {
  margin: 0.5rem;
}

.modal-content-mobile {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header-mobile {
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.mobile-modal-title {
  font-weight: 600;
  color: #212529;
  font-size: 1.1rem;
}

.modal-body-mobile {
  padding: 1.25rem;
  max-height: 70vh;
  overflow-y: auto;
}

/* Mobile Form Styles */
.mobile-form-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.mobile-form-control {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  min-height: 44px;
}

.mobile-help-text {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

@media (max-width: 575px) {
  .mobile-form-control {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Mobile Student Filter */
.mobile-students-label {
  font-size: 0.95rem;
}

.mobile-student-count {
  font-size: 0.8rem;
}

.mobile-filter-toggle {
  min-width: auto;
}

.toggle-label-mobile {
  min-width: 100px;
  text-align: left;
  font-size: 0.85rem;
}

/* Mobile Students Container */
.students-container-mobile {
  min-height: 250px;
  max-height: 60vh;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  background-color: #fafafa;
  position: relative;
}

.students-loading-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.students-content-mobile {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.students-empty-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
}

.mobile-empty-title {
  font-size: 0.95rem;
}

.mobile-empty-text {
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Mobile Select All */
.select-all-container-mobile {
  flex-shrink: 0;
  margin-bottom: 0.5rem;
}

.mobile-select-all-label {
  font-size: 0.9rem;
}

/* Mobile Student List */
.student-list-mobile {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-right: -0.5rem;
}

.student-item-mobile {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.student-item-mobile:hover {
  border-color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.1);
}

.student-info-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.student-name-mobile {
  font-weight: 500;
  color: #212529;
  font-size: 0.9rem;
}

.student-roll-mobile {
  font-size: 0.8rem;
}

.student-actions-mobile {
  align-items: center;
  gap: 0.5rem;
}

.mobile-badge {
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
}

.mobile-remove-btn {
  padding: 0.25rem 0.5rem;
  min-height: 32px;
  border-radius: 6px;
}

/* Mobile Modal Footer */
.modal-footer-mobile {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.mobile-modal-btn {
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.6rem 1.25rem;
  min-height: 44px;
  flex: 1;
}

/* Mobile Questions Modal */
.modal-questions-mobile {
  margin: 0.5rem;
}

.modal-content-questions {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header-questions {
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
}

.mobile-questions-title {
  font-weight: 600;
  color: #212529;
  font-size: 1.1rem;
}

.modal-body-questions {
  padding: 1.25rem;
  max-height: 70vh;
  overflow-y: auto;
}

/* Mobile Test Paper Info */
.test-paper-info-mobile {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid #007bff;
}

.mobile-paper-title {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.mobile-paper-info {
  margin-top: 0.75rem;
}

.mobile-info-item {
  text-align: center;
  padding: 0.75rem 0.5rem;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.mobile-info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
}

.mobile-info-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
}

.modal-footer-questions {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
  text-align: center;
}

.mobile-close-btn {
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.6rem 1.25rem;
  min-height: 44px;
}

/* Mobile Date Picker Optimizations */
@media (max-width: 768px) {
  .date-picker-dropdown {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90vw !important;
    max-width: 350px !important;
    z-index: 1060 !important;
    margin: 0 !important;
  }
  
  .datetime-dropdown {
    min-width: 90vw !important;
    max-width: 350px !important;
  }
  
  .date-picker-header {
    padding: 0.75rem;
  }
  
  .month-year {
    font-size: 1rem;
    min-width: 120px;
  }
  
  .nav-btn {
    width: 32px;
    height: 32px;
    font-size: 1.1rem;
  }
  
  .date-btn {
    min-height: 40px;
    font-size: 0.9rem;
  }
  
  .time-picker-section {
    padding: 0.75rem;
  }
  
  .time-input {
    width: 50px;
    padding: 6px 4px;
    font-size: 0.9rem;
  }
  
  .ampm-btn {
    padding: 3px 6px;
    font-size: 0.7rem;
    min-width: 30px;
  }
  
  .quick-time-buttons {
    gap: 0.25rem;
  }
  
  .quick-time-buttons .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
  .mobile-action-btn:hover {
    transform: none;
    box-shadow: none;
  }
  
  .test-paper-card-mobile:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .student-item-mobile:hover {
    border-color: #e9ecef;
    box-shadow: none;
  }
  
  /* Larger touch targets */
  .mobile-action-btn {
    min-height: 48px;
    padding: 0.75rem;
  }
  
  .mobile-modal-btn {
    min-height: 48px;
    padding: 0.75rem 1.25rem;
  }
  
  .mobile-remove-btn {
    min-height: 40px;
    padding: 0.5rem;
  }
}

/* Landscape Mobile Optimizations */
@media (max-width: 768px) and (orientation: landscape) {
  .modal-body-mobile {
    max-height: 60vh;
  }
  
  .students-container-mobile {
    max-height: 50vh;
  }
  
  .mobile-card-layout {
    padding: 0.75rem;
  }
  
  .mobile-summary-item {
    padding: 0.5rem;
  }
}

/* Very Small Screens */
@media (max-width: 375px) {
  .mobile-card-title {
    font-size: 1rem;
  }
  
  .mobile-summary-label {
    font-size: 0.7rem;
  }
  
  .mobile-summary-value {
    font-size: 0.85rem;
  }
  
  .mobile-action-btn {
    font-size: 0.75rem;
    padding: 0.5rem 0.5rem;
  }
  
  .mobile-modal-title {
    font-size: 1rem;
  }
  
  .modal-mobile-responsive {
    margin: 0.25rem;
  }
}

/* Legacy responsive adjustments */
@media (max-width: 768px) {
  .action-btn {
    min-width: 100%;
    margin-bottom: 0.5rem;
  }
}

/* Questions Display Styling (matching previewTestPaper.vue) */
.questions-container {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.75rem;
  background-color: #fafafa;
}

.question-item {
  background-color: transparent;
  border-radius: 0;
  border: none;
  box-shadow: none;
  transition: none;
  margin: 0;
  padding: 0;
}

.question-item:hover {
  box-shadow: none;
  transform: none;
}

.question-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin: 0;
  padding: 0;
  width: 100%;
}

.question-content {
  flex: 1;
}

.question-text {
  font-size: 1rem;
  font-weight: 500;
  color: #212529;
  line-height: 1.4;
  margin-bottom: 0.15rem;
}

.chapter-badge {
  background-color: #6c757d;
  color: white;
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.options-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.options-column {
  flex: 1;
}

.option-item-column {
  display: flex;
  align-items: center;
  border-radius: 0;
  border: none;
  background: none;
  transition: background-color 0.3s ease;
}

.option-item-column:hover {
  background-color: transparent;
}

.option-item-column.correct-option {
  background-color: transparent !important;
  color: #1e7e34;
}

.option-item-column.correct-option:hover {
  background-color: transparent !important;
}

.option-item-column.correct-option .option-label,
.option-item-column.correct-option .option-text {
  color: #1e7e34;
  font-weight: 600;
}

.option-prefix {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.correct-tick {
  color: #1e7e34;
  font-size: 0.9rem;
}

.tick-placeholder {
  width: 16px;
  height: 16px;
  display: inline-block;
}

.option-label {
  font-weight: 600;
  margin-right: 0.5rem;
  min-width: 20px;
  color: #495057;
  font-size: 0.9rem;
}

.option-text {
  flex: 1;
  color: #212529;
  font-size: 0.9rem;
}

.question-marks {
  text-align: right;
}

.marks-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.marks {
  font-size: 0.9rem;
  font-weight: 500;
}

.question-divider {
  color: inherit;
  border: 0;
  border-top: var(--bs-border-width) solid;
  opacity: .25;
}

/* Assignment Modal Specific Styling */
.modal-body-fixed {
  min-height: 500px;
  max-height: 50vh;
  overflow-y: auto;
}

.students-container {
  min-height: 300px;
  max-height: 350px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fafafa;
  position: relative;
}

.students-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
}

.students-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.students-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
  text-align: center;
}

.select-all-container {
  flex-shrink: 0;
  margin-bottom: 0.5rem;
}

.student-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-right: -0.5rem;
}

.student-item {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.student-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.student-item .form-check {
  margin-bottom: 0;
}

.student-item .form-check-label {
  width: 100%;
  cursor: pointer;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.student-name {
  font-weight: 500;
  color: #212529;
}

.student-roll {
  font-size: 0.85rem;
}

.student-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Modal Dialog Adjustments */
#assignModal .modal-dialog {
  max-width: 800px;
}

#assignModal .modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

#assignModal .modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1.25rem 1.5rem;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

#assignModal .modal-title {
  font-weight: 600;
  color: #212529;
}

#assignModal .modal-body {
  padding: 1.5rem;
}

#assignModal .modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
}

/* Custom scrollbar for student list */
.student-list::-webkit-scrollbar {
  width: 6px;
}

.student-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.student-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.student-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Form styling improvements */
.form-label.fw-semibold {
  font-weight: 600;
  color: #495057;
}

.form-check-label.fw-semibold {
  font-weight: 600;
}

/* Toggle switch styling */
.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.form-check-input:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Badge improvements */
.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.35em 0.65em;
}

/* Button improvements */
.btn-sm {
  --bs-btn-padding-y: 0.25rem;
  --bs-btn-padding-x: 0.5rem;
  --bs-btn-font-size: 0.875rem;
}

.btn-outline-danger:hover {
  transform: translateY(-1px);
}

/* Loading spinner color */
.text-primary .spinner-border {
  color: #007bff !important;
}

/* Fix toggle label position jumping */
.toggle-label-fixed {
  min-width: 110px;
  text-align: left;
  display: inline-block;
}

/* Custom date input styling */
.date-input-custom::-webkit-calendar-picker-indicator {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='%23212529' d='M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z'/%3e%3c/svg%3e");
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position: center;
}

.datetime-input-custom::-webkit-calendar-picker-indicator {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='%23212529' d='M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z'/%3e%3c/svg%3e");
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position: center;
}

/* Style the date input to show DD/MM/YYYY format hint */
.date-input-custom:invalid,
.datetime-input-custom:invalid {
  background-color: #fff;
}

/* Modern Custom Date Picker Styles */
.custom-date-picker,
.custom-datetime-picker {
  position: relative;
}

.date-input-modern,
.datetime-input-modern {
  cursor: pointer;
  padding-right: 40px;
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.date-input-modern:focus,
.datetime-input-modern:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.date-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 5;
}

/* Date Picker Dropdown */
.date-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
  animation: fadeInDown 0.2s ease-out;
}

.datetime-dropdown {
  min-width: 320px;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Date Picker Header */
.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f3f4;
  background-color: white;
  border-radius: 8px 8px 0 0;
}

.month-year {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  min-width: 140px;
  text-align: center;
}

.nav-btn {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background-color: #e9ecef;
  color: #212529;
}

/* Calendar Grid */
.date-picker-calendar {
  padding: 0.75rem;
  background-color: white;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  padding: 8px 4px;
  text-transform: uppercase;
}

.dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.date-btn {
  border: none;
  background: none;
  padding: 10px 4px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-btn:not(.other-month):hover {
  background-color: #e3f2fd;
  color: #1976d2;
}

.date-btn.other-month {
  color: #c4c4c4;
  cursor: not-allowed;
}

.date-btn.selected {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 600;
  border: 1px solid #bbdefb;
}

.date-btn.today {
  background-color: #e8f5e8;
  color: #2e7d32;
  font-weight: 600;
  border: 1px solid #c8e6c9;
}

.date-btn.selected.today {
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

/* Time Picker Section */
.time-picker-section {
  border-top: 1px solid #f1f3f4;
  padding: 0.75rem 1rem;
  
}

.time-picker-header {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
  text-align: center;
}

.time-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-input {
  width: 60px;
  padding: 8px 4px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
}

.time-input:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.time-input-group label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 4px;
  font-weight: 500;
}

.time-separator {
  font-size: 1.5rem;
  font-weight: bold;
  color: #495057;
  margin: 0 0.25rem;
  align-self: flex-start;
  margin-top: 8px;
}

.ampm-toggle {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 0.5rem;
}

.ampm-btn {
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 36px;
  text-align: center;
}

.ampm-btn:hover {
  border-color: #86b7fe;
  background-color: #f8f9fa;
}

.ampm-btn.active {
  background-color: #e3f2fd;
  border-color: #bbdefb;
  color: #1976d2;
  font-weight: 600;
}

.quick-time-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-time-buttons .btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
}

/* Date Picker Footer */
.date-picker-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 0.75rem 1rem;
  border-top: 1px solid #f1f3f4;
  background-color: white;
  border-radius: 0 0 8px 8px;
}

.date-picker-footer .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .date-picker-modal {
    margin: 1rem;
    min-width: auto;
    width: calc(100% - 2rem);
    max-width: none;
  }
  
  .datetime-modal {
    min-width: auto;
  }
  
  .date-picker-header {
    padding: 0.75rem 1rem;
  }
  
  .month-year {
    font-size: 1rem;
    min-width: 120px;
  }
  
  .date-picker-calendar {
    padding: 0.75rem;
  }
  
  .time-picker-section {
    padding: 0.75rem 1rem;
  }
  
  .date-picker-footer {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
  }
  
  .date-picker-footer .btn {
    flex: 1;
    min-width: auto;
  }
  
  .quick-time-buttons {
    gap: 0.25rem;
  }
  
  .quick-time-buttons .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .date-picker-modal {
    background: #2d3748;
    color: #e2e8f0;
  }
  
  .date-picker-header {
    background-color: #4a5568;
    border-bottom-color: #4a5568;
  }
  
  .time-picker-section {
    background-color: #4a5568;
    border-top-color: #4a5568;
  }
  
  .weekday {
    color: #a0aec0;
  }
  
  .date-btn:not(.other-month):hover {
    background-color: #4299e1;
    color: white;
  }
  
  .date-btn.other-month {
    color: #718096;
  }
  
  .time-input {
    background-color: #4a5568;
    border-color: #718096;
    color: #e2e8f0;
  }
}
</style>
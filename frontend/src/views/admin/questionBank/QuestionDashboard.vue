<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="{ name: 'questionBank' }" aria-label="Close"></router-link>
      </div>
      <div class="row justify-content-center align-items-center">
        <div class="col col-12 col-sm-5">
          <p class="text-muted text-start fs-6 m-0">
            <span class="col-12 col-md-auto">{{ questionBankData.boardName }} | </span>
            <span class="col-12 col-md-auto"> {{ questionBankData.mediumName }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark m-0">
           Standard {{ questionBankData.standardName }}
            <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} | {{ questionBankData.chapterName }}</span>
          </h4>
        </div>
        <div class="col col-12 col-sm-5 dynamic-style text-end align-self-end">
          <div class="row justify-content-end align-items-end g-2">
            <div class="col col-5 col-sm-auto text-end">
              <router-link class="btn btn-dark stick-bottom" :to="{ name: 'addQuestion' }" id="addButton">Add Questions</router-link>
            </div>
            <div class="col col-7 col-sm-auto text-end">
              <router-link class="btn btn-light" style="border: 1px solid gray !important;" id="addButton" :to="{ name: 'translationPending' }">Translation Pending</router-link>
            </div>
          </div>
        </div>
      </div>
      <hr>
    </div>

    <div id="questionsSection" class="container">
      <div class="container mb-4">
        <div class="row g-2 my-2 justify-content-center">
          <div class="col-12 col-md-10">
            <!-- Search, Sort and Filter in One Row (styled like PatternDashboard) -->
            <div class="d-flex gap-2 mb-2">
              <!-- Search Bar -->
              <div class="search-field flex-grow-1">
                <i class="bi bi-search search-icon"></i>
                <input
                  type="text"
                  class="form-control search-input"
                  id="searchBar"
                  placeholder="Search questions..."
                  v-model="searchQuery"
                  @input="handleSearchInput"
                  autocomplete="off"
                  ref="searchInputRef"
                />
                <i v-if="isSearching" class="bi bi-arrow-repeat search-loading-icon"></i>
                <i v-else-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="clearSearch"></i>
              </div>

              <!-- Sort Dropdown -->
              <div class="sort-field" style="min-width: 220px;">
                <select class="form-select sort-select" id="sortSelect" v-model="sortOption" @change="filterCards">
                  <option value="question_text_asc">Sort by Question (A-Z)</option>
                  <option value="question_text_desc">Sort by Question (Z-A)</option>
                  <option value="question_type_id_asc">Sort by Question Type (A-Z)</option>
                  <option value="question_type_id_desc">Sort by Question Type (Z-A)</option>
                  <option value="created_at_asc">Sort by Created (Oldest)</option>
                  <option value="created_at_desc">Sort by Created (Newest)</option>
                  <option value="updated_at_asc">Sort by Updated (Oldest)</option>
                  <option value="updated_at_desc">Sort by Updated (Newest)</option>
                </select>
              </div>

              <!-- Filter Button -->
              <div class="filter-field">
                <button
                  class="btn filter-btn"
                  @click="toggleFilterIcon"
                  aria-expanded="false"
                  aria-controls="filter"
                  :class="{ 'active': isFilterOpen }"
                >
                  <i class="bi bi-funnel"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Collapsible Filter Section -->
        <div class="row g-2 justify-content-center">
          <div class="col-12 col-md-10 collapse" id="filter">
            <div class="card border-0">
              <div class="card-body">
                <div class="container p-0">
                  <div class="row g-2 mb-2">
                    <div class="col-md-6">
                      <SearchableDropdown
                        id="filterTopic"
                        label="Filter by Topic"
                        placeholder="Select Topic"
                        :items="topics"
                        v-model="selectedTopicObj"
                        labelKey="name"
                        valueKey="id"
                        @change="filterCards"
                        :required="false"
                      />
                    </div>
                    <div class="col-md-6">
                      <SearchableDropdown
                        id="filterType"
                        label="Filter by Type"
                        placeholder="Select Type"
                        :items="questionTypes"
                        v-model="selectedTypeObj"
                        labelKey="type_name"
                        valueKey="id"
                        @change="filterCards"
                        :required="false"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verified/Unverified Toggle Section - Always Visible -->
        <div class="row g-2 my-2 justify-content-center">
          <div class="col-12 col-md-10">
            <div class="row mb-2 justify-content-end align-items-center">
              <!-- First column: Label Before -->
              <div class="col-auto text-end">
                <label id="verifiedLabel" class="form-check-label fw-bold" :class="{ 'text-dark': !showUnverified, 'text-secondary': showUnverified }" for="flexSwitchCheckBefore">Verified</label>
              </div>

              <!-- Second column: The Switch -->
              <div class="col-auto text-center">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="flexSwitchCheckBefore" v-model="showUnverified">
                </div>
              </div>

              <!-- Third column: Label After -->
              <div class="col-auto text-start">
                <label id="unverifiedLabel" class="form-check-label fw-bold" :class="{ 'text-dark': showUnverified, 'text-secondary': !showUnverified }" for="flexSwitchCheckBefore">Unverified</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !isSearching" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Content when data is loaded -->
      <div class="container mb-5">
        <!-- Verified Questions -->
        <div class="row g-2 justify-content-center position-relative" id="verifiedContainer" v-show="!showUnverified">
          <!-- Loading overlay for search -->
          <div v-if="isSearching" class="search-loading-overlay">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Searching...</span>
            </div>
          </div>

          <div v-for="(question, index) in filteredVerifiedQuestions" :key="'verified-' + index" class="col-12 col-md-10">
            <div class="card" :data-unique-id="'verified-' + index" :class="{ 'card-searching': isSearching }">
              <div class="row g-0">
                <div class="col-12">
                  <div class="card-body">
                    <div class="col-12 text-end">
                      <i class="bi bi-pencil-square fs-4 me-2" @click="editQuestion(question)"></i>
                      <i class="bi bi-eraser fs-4 mx-2" @click="openRemoveConfirmationModal(index, 'verified')"></i>
                      <i class="bi bi-trash3 fs-4 ms-2" @click="openDeleteConfirmationModal(index, 'verified')"></i>
                    </div>
                    <blockquote class="blockquote mb-0">
                      <p class="card-text">
                        <strong>Q{{ (currentPage - 1) * pageSize + index + 1 }}:</strong> &nbsp;
                        <span v-if="shouldTruncateQuestion(question.question) && !isQuestionExpanded(question.id, 'question')">
                          {{ truncateText(question.question, questionTextMaxLength) }}
                          <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'question')">
                            <i class="bi bi-chevron-down"></i> Show More
                          </button>
                        </span>
                        <span v-else>
                          {{ question.question }}
                          <button v-if="shouldTruncateQuestion(question.question)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'question')">
                            <i class="bi bi-chevron-up"></i> Show Less
                          </button>
                        </span>
                      </p>

                      <!-- Question Image Loading State -->
                      <div v-if="question.imageLoading" class="question-image-loading-container mb-3">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading image...</span>
                        </div>
                      </div>

                      <!-- Question Image (if available) -->
                      <div v-else-if="question.imageUrl" class="question-image-container mb-3">
                        <div v-if="question.imageLoadingState" class="image-loading-overlay">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading image...</span>
                          </div>
                        </div>
                        <img
                          :src="question.imageUrl"
                          class="question-image"
                          alt="Question Image"
                          @load="handleImageLoad(question)"
                          @error="handleImageError(question)"
                        />
                        <div v-if="question.imageError" class="image-error-message">
                          <i class="bi bi-exclamation-triangle"></i>
                          Failed to load image
                        </div>
                      </div>

                      <!-- True or False question type - completely simplified -->
                      <div v-if="question.type === 'True or False'">
                        <!-- No additional content needed -->
                      </div>

                      <!-- One-Word Answer -->
                      <div v-if="question.type === 'One-Word Answer'" class="mt-3">
                        <div class="mcq-header d-flex align-items-center mb-2">
                          <div class="mcq-title">
                            <span class="badge bg-dark me-2">One-Word Answer</span>
                          </div>
                          <div class="flex-grow-1">
                            <hr class="my-0">
                          </div>
                        </div>
                        <div class="oneword-container p-3" v-if="question.correctAnswer">
                          <div class="correct-answer-container">
                            <div class="answer-label">Correct Answer:</div>
                            <div class="answer-value">{{ question.correctAnswer }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- Short Answer Question -->
                      <div v-if="question.type === 'Short Answer Question'" class="mt-3">
                        <div class="mcq-header d-flex align-items-center mb-2">
                          <div class="mcq-title">
                            <span class="badge bg-dark me-2">Short Answer Question</span>
                          </div>
                          <div class="flex-grow-1">
                            <hr class="my-0">
                          </div>
                        </div>
                        <div class="shortanswer-container p-3 border rounded bg-light">
                          <div class="text-muted fst-italic">
                            <i class="bi bi-info-circle me-1"></i> Short answer expected (approximately 2-3 sentences)
                          </div>
                        </div>
                      </div>

                      <!-- MCQ Options in verified questions section -->
                      <!-- MCQ Options -->
                      <div v-if="question.type === 'Multiple Choice Question (MCQ)'" class="mt-3">
                        <div class="row g-2">
                          <div v-for="(option, optIndex) in question.options" :key="optIndex" class="col-12 col-md-6">
                            <div class="d-flex align-items-center mb-2" :class="{'text-success fw-bold': question.correctOptionIndex === optIndex}">
                              <div class="option-letter me-2" :class="{'text-success': question.correctOptionIndex === optIndex}">
                                {{ String.fromCharCode(65 + optIndex) }}
                              </div>
                              <div class="option-text flex-grow-1">
                                <span v-if="shouldTruncateOption(option) && !isQuestionExpanded(question.id, 'option-'+optIndex)">
                                  {{ truncateText(option, optionTextMaxLength) }}
                                  <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'option-'+optIndex)">
                                    <i class="bi bi-chevron-down"></i>
                                  </button>
                                </span>
                                <span v-else>
                                  {{ option }}
                                  <button v-if="shouldTruncateOption(option)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'option-'+optIndex)">
                                    <i class="bi bi-chevron-up"></i>
                                  </button>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Match the Pairs -->
                      <div v-if="question.type === 'Match the Pairs'" class="mt-3">
                        <!-- Debug info for development -->
                        <div v-if="!question.lhs || !question.rhs || question.lhs.length === 0 || question.rhs.length === 0" class="alert alert-warning">
                          <i class="bi bi-exclamation-triangle me-2"></i>
                          No matching pairs data available for this question. Please check the API response.
                          <div class="small mt-2">
                            <strong>Question ID:</strong> {{ question.id }}<br>
                            <strong>Question Type:</strong> {{ question.type }}<br>
                            <strong>Has LHS:</strong> {{ question.lhs ? 'Yes (' + question.lhs.length + ' items)' : 'No' }}<br>
                            <strong>Has RHS:</strong> {{ question.rhs ? 'Yes (' + question.rhs.length + ' items)' : 'No' }}
                          </div>
                        </div>

                        <div v-else>
                          <div class="match-pairs-container">
                            <div v-for="(item, idx) in question.lhs" :key="'pair-'+idx" class="match-pair-row mb-3">
                              <!-- Left Side Item -->
                              <div class="match-pair-item">
                                <div class="d-flex align-items-center">
                                  <div class="option-letter me-2">
                                    {{ String.fromCharCode(65 + idx) }}
                                  </div>
                                  <div class="option-text flex-grow-1">
                                    <span v-if="shouldTruncateOption(item) && !isQuestionExpanded(question.id, 'lhs-'+idx)">
                                      {{ truncateText(item, optionTextMaxLength) }}
                                      <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'lhs-'+idx)">
                                        <i class="bi bi-chevron-down"></i>
                                      </button>
                                    </span>
                                    <span v-else>
                                      {{ item }}
                                      <button v-if="shouldTruncateOption(item)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'lhs-'+idx)">
                                        <i class="bi bi-chevron-up"></i>
                                      </button>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <!-- Arrow Between -->
                              <div class="match-pair-arrow">
                                <div class="match-arrow-circle">
                                  <i class="bi bi-arrows"></i>
                                </div>
                              </div>

                              <!-- Right Side Item -->
                              <div class="match-pair-item">
                                <div class="d-flex align-items-center">
                                  <div class="option-text flex-grow-1">
                                    <span v-if="question.rhs && idx < question.rhs.length">
                                      <span v-if="shouldTruncateOption(question.rhs[idx]) && !isQuestionExpanded(question.id, 'rhs-'+idx)">
                                        {{ truncateText(question.rhs[idx], optionTextMaxLength) }}
                                        <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'rhs-'+idx)">
                                          <i class="bi bi-chevron-down"></i>
                                        </button>
                                      </span>
                                      <span v-else>
                                        {{ question.rhs[idx] }}
                                        <button v-if="shouldTruncateOption(question.rhs[idx])" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'rhs-'+idx)">
                                          <i class="bi bi-chevron-up"></i>
                                        </button>
                                      </span>
                                    </span>
                                    <span v-else class="text-muted fst-italic">No matching option</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Add the Odd One Out component to the verified questions section -->
                      <!-- Odd One Out -->
                      <div v-if="question.type === 'Odd One Out'" class="mt-3">
                        <div class="row g-2">
                          <div v-for="(option, optIndex) in question.options" :key="optIndex" class="col-12 col-md-6">
                            <div class="d-flex align-items-center mb-2" :class="{'text-success fw-bold': question.correctOptionIndex === optIndex}">
                              <div class="option-letter me-2" :class="{'text-success': question.correctOptionIndex === optIndex}">
                                {{ String.fromCharCode(65 + optIndex) }}
                              </div>
                              <div class="option-text flex-grow-1">
                                <span v-if="shouldTruncateOption(option) && !isQuestionExpanded(question.id, 'option-'+optIndex)">
                                  {{ truncateText(option, optionTextMaxLength) }}
                                  <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'option-'+optIndex)">
                                    <i class="bi bi-chevron-down"></i>
                                  </button>
                                </span>
                                <span v-else>
                                  {{ option }}
                                  <button v-if="shouldTruncateOption(option)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'option-'+optIndex)">
                                    <i class="bi bi-chevron-up"></i>
                                  </button>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Complete the Correlation question type -->
                      <div v-if="question.type === 'Complete the Correlation'" class="mt-3">
                        <div class="mcq-header d-flex align-items-center mb-2">
                          <div class="mcq-title">
                            <span class="badge bg-dark me-2">Complete the Correlation</span>
                          </div>
                          <div class="flex-grow-1">
                            <hr class="my-0">
                          </div>
                        </div>
                        <div class="correlation-container">
                          <table class="table table-bordered correlation-table">
                            <thead class="table-light">
                              <tr>
                                <th width="5%" class="text-center">#</th>
                                <th width="40%" class="text-center">Given</th>
                                <th width="10%" class="text-center"><i class="bi bi-arrow-left-right"></i></th>
                                <th width="40%" class="text-center">Complete</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(rhs, idx) in question.rhs" :key="idx"
                                  :class="{ 'table-secondary': !(question.lhs && question.lhs[idx]) }">
                                <td class="text-center align-middle correlation-number">{{ idx + 1 }}</td>
                                <td class="align-middle">
                                  <div class="correlation-item">
                                    <span v-if="question.lhs && question.lhs[idx]">
                                      {{ question.lhs[idx] }}
                                    </span>
                                    <span v-else class="text-muted fst-italic">No correlation available</span>
                                  </div>
                                </td>
                                <td class="text-center align-middle correlation-arrow">
                                  <i class="bi bi-link-45deg"></i>
                                </td>
                                <td class="align-middle">
                                  <div class="correlation-item" :class="{'correlation-highlight': question.correctCorrelation && question.correctCorrelation.includes(idx)}">
                                    {{ rhs }}
                                    <i v-if="question.correctCorrelation && question.correctCorrelation.includes(idx)"
                                       class="bi bi-check-circle-fill text-success ms-2"></i>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <footer class="blockquote-footer text-end mt-2">
                        {{ getTopicsDisplay(question) }} <br> {{ question.type }}
                        <span v-if="question.isPreviousExam" class="badge bg-info ms-2">Board Exam</span>
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-if="filteredVerifiedQuestions.length === 0 && !isSearching" class="col-12 col-md-10 text-center my-5">
            <p class="text-muted">No matching questions found.</p>
          </div>
        </div>

        <!-- Unverified Questions -->
        <div class="row g-2 justify-content-center position-relative" id="unverifiedContainer" v-show="showUnverified">
          <!-- Loading overlay for search -->
          <div v-if="isSearching" class="search-loading-overlay">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Searching...</span>
            </div>
          </div>

          <div v-for="(question, index) in filteredUnverifiedQuestions" :key="'unverified-' + index" class="col-12 col-md-10">
            <div class="card" :class="{ 'card-searching': isSearching }" :data-unique-id="'unverified-' + index">
              <div class="row g-0">
                <div class="col-12">
                  <div class="card-body">
                    <div class="col-12 text-end">
                      <i class="bi bi-pencil-square fs-4 me-2" @click="editQuestion(question)"></i>
                      <i class="bi bi-eraser fs-4 mx-2" @click="openRemoveConfirmationModal(index, 'unverified')"></i>
                      <i class="bi bi-check-lg fs-4 ms-2" @click="openVerifyConfirmationModal(index)"></i>
                    </div>
                    <blockquote class="blockquote mb-0">
                      <p class="card-text">
                        <strong>Q{{ (currentPage - 1) * pageSize + index + 1 }}:</strong> &nbsp;
                        <span v-if="shouldTruncateQuestion(question.question) && !isQuestionExpanded(question.id, 'question')">
                          {{ truncateText(question.question, questionTextMaxLength) }}
                          <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'question')">
                            <i class="bi bi-chevron-down"></i> Show More
                          </button>
                        </span>
                        <span v-else>
                          {{ question.question }}
                          <button v-if="shouldTruncateQuestion(question.question)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'question')">
                            <i class="bi bi-chevron-up"></i> Show Less
                          </button>
                        </span>
                      </p>

                      <!-- Question Image Loading State -->
                      <div v-if="question.imageLoading" class="question-image-loading-container mb-3">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading image...</span>
                        </div>
                      </div>

                      <!-- Question Image (if available) -->
                      <div v-else-if="question.imageUrl" class="question-image-container mb-3">
                        <div v-if="question.imageLoadingState" class="image-loading-overlay">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading image...</span>
                          </div>
                        </div>
                        <img
                          :src="question.imageUrl"
                          class="question-image"
                          alt="Question Image"
                          @load="handleImageLoad(question)"
                          @error="handleImageError(question)"
                        />
                        <div v-if="question.imageError" class="image-error-message">
                          <i class="bi bi-exclamation-triangle"></i>
                          Failed to load image
                        </div>
                      </div>

                      <!-- True or False question type - completely simplified -->
                      <div v-if="question.type === 'True or False'">
                        <!-- No additional content needed -->
                      </div>

                      <!-- One-Word Answer -->
                      <div v-if="question.type === 'One-Word Answer'" class="mt-3">
                        <div class="mcq-header d-flex align-items-center mb-2">
                          <div class="mcq-title">
                            <span class="badge bg-dark me-2">One-Word Answer</span>
                          </div>
                          <div class="flex-grow-1">
                            <hr class="my-0">
                          </div>
                        </div>
                        <div class="oneword-container p-3" v-if="question.correctAnswer">
                          <div class="correct-answer-container">
                            <div class="answer-label">Correct Answer:</div>
                            <div class="answer-value">{{ question.correctAnswer }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- Short Answer Question -->
                      <div v-if="question.type === 'Short Answer Question'" class="mt-3">
                        <div class="mcq-header d-flex align-items-center mb-2">
                          <div class="mcq-title">
                            <span class="badge bg-dark me-2">Short Answer Question</span>
                          </div>
                          <div class="flex-grow-1">
                            <hr class="my-0">
                          </div>
                        </div>
                        <div class="shortanswer-container p-3 border rounded bg-light">
                          <div class="text-muted fst-italic">
                            <i class="bi bi-info-circle me-1"></i> Short answer expected (approximately 2-3 sentences)
                          </div>
                        </div>
                      </div>

                      <!-- MCQ Options in unverified questions section -->
                      <!-- MCQ Options -->
                      <div v-if="question.type === 'Multiple Choice Question (MCQ)'" class="mt-3">
                        <div class="row g-2">
                          <div v-for="(option, optIndex) in question.options" :key="optIndex" class="col-12 col-md-6">
                            <div class="d-flex align-items-center mb-2" :class="{'text-success fw-bold': question.correctOptionIndex === optIndex}">
                              <div class="option-letter me-2" :class="{'text-success': question.correctOptionIndex === optIndex}">
                                {{ String.fromCharCode(65 + optIndex) }}
                              </div>
                              <div class="option-text flex-grow-1">
                                <span v-if="shouldTruncateOption(option) && !isQuestionExpanded(question.id, 'option-'+optIndex)">
                                  {{ truncateText(option, optionTextMaxLength) }}
                                  <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'option-'+optIndex)">
                                    <i class="bi bi-chevron-down"></i>
                                  </button>
                                </span>
                                <span v-else>
                                  {{ option }}
                                  <button v-if="shouldTruncateOption(option)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'option-'+optIndex)">
                                    <i class="bi bi-chevron-up"></i>
                                  </button>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Match the Pairs -->
                      <div v-if="question.type === 'Match the Pairs'" class="mt-3">
                        <!-- Debug info for development -->
                        <div v-if="!question.lhs || !question.rhs || question.lhs.length === 0 || question.rhs.length === 0" class="alert alert-warning">
                          <i class="bi bi-exclamation-triangle me-2"></i>
                          No matching pairs data available for this question. Please check the API response.
                          <div class="small mt-2">
                            <strong>Question ID:</strong> {{ question.id }}<br>
                            <strong>Question Type:</strong> {{ question.type }}<br>
                            <strong>Has LHS:</strong> {{ question.lhs ? 'Yes (' + question.lhs.length + ' items)' : 'No' }}<br>
                            <strong>Has RHS:</strong> {{ question.rhs ? 'Yes (' + question.rhs.length + ' items)' : 'No' }}
                          </div>
                        </div>

                        <div v-else>
                          <div class="match-pairs-container">
                            <div v-for="(item, idx) in question.lhs" :key="'pair-'+idx" class="match-pair-row mb-3">
                              <!-- Left Side Item -->
                              <div class="match-pair-item">
                                <div class="d-flex align-items-center">
                                  <div class="option-letter me-2">
                                    {{ String.fromCharCode(65 + idx) }}
                                  </div>
                                  <div class="option-text flex-grow-1">
                                    <span v-if="shouldTruncateOption(item) && !isQuestionExpanded(question.id, 'lhs-'+idx)">
                                      {{ truncateText(item, optionTextMaxLength) }}
                                      <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'lhs-'+idx)">
                                        <i class="bi bi-chevron-down"></i>
                                      </button>
                                    </span>
                                    <span v-else>
                                      {{ item }}
                                      <button v-if="shouldTruncateOption(item)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'lhs-'+idx)">
                                        <i class="bi bi-chevron-up"></i>
                                      </button>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <!-- Arrow Between -->
                              <div class="match-pair-arrow">
                                <div class="match-arrow-circle">
                                  <i class="bi bi-arrows"></i>
                                </div>
                              </div>

                              <!-- Right Side Item -->
                              <div class="match-pair-item">
                                <div class="d-flex align-items-center">
                                  <div class="option-text flex-grow-1">
                                    <span v-if="question.rhs && idx < question.rhs.length">
                                      <span v-if="shouldTruncateOption(question.rhs[idx]) && !isQuestionExpanded(question.id, 'rhs-'+idx)">
                                        {{ truncateText(question.rhs[idx], optionTextMaxLength) }}
                                        <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'rhs-'+idx)">
                                          <i class="bi bi-chevron-down"></i>
                                        </button>
                                      </span>
                                      <span v-else>
                                        {{ question.rhs[idx] }}
                                        <button v-if="shouldTruncateOption(question.rhs[idx])" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'rhs-'+idx)">
                                          <i class="bi bi-chevron-up"></i>
                                        </button>
                                      </span>
                                    </span>
                                    <span v-else class="text-muted fst-italic">No matching option</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Add the Odd One Out component to the verified questions section -->
                      <!-- Odd One Out -->
                      <div v-if="question.type === 'Odd One Out'" class="mt-3">
                        <div class="row g-2">
                          <div v-for="(option, optIndex) in question.options" :key="optIndex" class="col-12 col-md-6">
                            <div class="d-flex align-items-center mb-2" :class="{'text-success fw-bold': question.correctOptionIndex === optIndex}">
                              <div class="option-letter me-2" :class="{'text-success': question.correctOptionIndex === optIndex}">
                                {{ String.fromCharCode(65 + optIndex) }}
                              </div>
                              <div class="option-text flex-grow-1">
                                <span v-if="shouldTruncateOption(option) && !isQuestionExpanded(question.id, 'option-'+optIndex)">
                                  {{ truncateText(option, optionTextMaxLength) }}
                                  <button class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'option-'+optIndex)">
                                    <i class="bi bi-chevron-down"></i>
                                  </button>
                                </span>
                                <span v-else>
                                  {{ option }}
                                  <button v-if="shouldTruncateOption(option)" class="btn btn-sm btn-link p-0 ms-1" @click="toggleExpand(question.id, 'option-'+optIndex)">
                                    <i class="bi bi-chevron-up"></i>
                                  </button>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Complete the Correlation question type -->
                      <div v-if="question.type === 'Complete the Correlation'" class="mt-3">
                        <div class="mcq-header d-flex align-items-center mb-2">
                          <div class="mcq-title">
                            <span class="badge bg-dark me-2">Complete the Correlation</span>
                          </div>
                          <div class="flex-grow-1">
                            <hr class="my-0">
                          </div>
                        </div>
                        <div class="correlation-container">
                          <table class="table table-bordered correlation-table">
                            <thead class="table-light">
                              <tr>
                                <th width="5%" class="text-center">#</th>
                                <th width="40%" class="text-center">Given</th>
                                <th width="10%" class="text-center"><i class="bi bi-arrow-left-right"></i></th>
                                <th width="40%" class="text-center">Complete</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(rhs, idx) in question.rhs" :key="idx"
                                  :class="{ 'table-secondary': !(question.lhs && question.lhs[idx]) }">
                                <td class="text-center align-middle correlation-number">{{ idx + 1 }}</td>
                                <td class="align-middle">
                                  <div class="correlation-item">
                                    <span v-if="question.lhs && question.lhs[idx]">
                                      {{ question.lhs[idx] }}
                                    </span>
                                    <span v-else class="text-muted fst-italic">No correlation available</span>
                                  </div>
                                </td>
                                <td class="text-center align-middle correlation-arrow">
                                  <i class="bi bi-link-45deg"></i>
                                </td>
                                <td class="align-middle">
                                  <div class="correlation-item" :class="{'correlation-highlight': question.correctCorrelation && question.correctCorrelation.includes(idx)}">
                                    {{ rhs }}
                                    <i v-if="question.correctCorrelation && question.correctCorrelation.includes(idx)"
                                       class="bi bi-check-circle-fill text-success ms-2"></i>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <footer class="blockquote-footer text-end mt-2">
                        {{ getTopicsDisplay(question) }} <br> {{ question.type }}
                        <span v-if="question.isPreviousExam" class="badge bg-info ms-2">Board Exam</span>
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-if="filteredUnverifiedQuestions.length === 0 && !isSearching" class="col-12 col-md-10 text-center my-5">
            <p class="text-muted">No matching questions found.</p>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="row mt-3 p-2 justify-content-center mb-5">
        <div class="col-12 col-md-10">
          <div class="d-flex justify-content-between align-items-center">
            <!-- Pagination Info -->
            <div class="text-muted">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to
              {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} entries
            </div>

            <!-- Pagination Buttons -->
            <nav aria-label="Question pagination">
              <ul class="pagination mb-0">
                <!-- Previous Page Button -->
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>

                <!-- Page Numbers -->
                <li v-for="page in visiblePageNumbers" :key="page" class="page-item"
                    :class="{ active: page === currentPage, disabled: page === '...' }">
                  <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="changePage(Number(page))">{{ page }}</a>
                  <span v-else class="page-link">...</span>
                </li>

                <!-- Next Page Button -->
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification
      :show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :type="toastType"
      @close="closeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import { Modal, Collapse } from 'bootstrap'
import ToastNotification from '@/components/common/ToastNotification.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import { useToastStore } from '@/store/toast'

// Define interfaces for API response
interface ApiTopic {
  id: number;
  chapter_id: number;
  name: string;
}

interface ApiImage {
  id: number;
  original_filename: string;
  file_size: number;
  file_type: string;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
  presigned_url: string;
}

interface ApiMcqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiMatchPair {
  id: number;
  question_text_id: number;
  left_text: string;
  right_text: string;
  left_image_id: number | null;
  right_image_id: number | null;
  created_at: string;
  updated_at: string;
  left_image: ApiImage | null;
  right_image: ApiImage | null;
}

interface ApiQuestionText {
  id: number;
  question_id: number;
  image_id: number | null;
  question_text: string;
  created_at?: string;
  updated_at?: string;
  image: ApiImage | null;
  mcq_options: ApiMcqOption[];
  match_pairs: ApiMatchPair[];
  topic: ApiTopic;
}

interface ApiQuestionType {
  id: number;
  type_name: string;
}

interface ApiQuestion {
  id: number;
  board_question: boolean;
  question_type: ApiQuestionType;
  question_texts: ApiQuestionText[];
  created_at?: string;
  updated_at?: string;
  is_verified?: boolean;
}

// Define interfaces for component's internal use
interface Topic {
  id: number;
  name: string;
}

interface Question {
  id: number;
  question: string;
  type: string;
  typeId: number;
  topics: Topic[];
  options?: string[];
  correctOptionIndex?: number;
  lhs?: string[];
  rhs?: string[];
  correctAnswer?: string;
  topic?: string;
  isPreviousExam: boolean;
  isVerified: boolean;
  imageId?: number | null;
  imageUrl?: string | null;
  imageLoading?: boolean;
  imageError?: boolean;
  imageLoadingState?: boolean;
  correctCorrelation?: number[];
}

// Component name (for linter)
defineOptions({
  name: 'QuestionDashboard'
})

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

// Data from localStorage
const questionBankData = ref({
  boardId: '',
  boardName: '',
  mediumId: '',
  mediumName: '',
  standardId: '',
  standardName: '',
  subjectId: '',
  subjectName: '',
  chapterId: '',
  chapterName: '',
  mediumStandardSubjectId: null
})

// Questions data
const verifiedQuestions = ref<Question[]>([])
const unverifiedQuestions = ref<Question[]>([])
const topics = ref<Topic[]>([])
const questionTypes = ref<{ id: number; type_name: string }[]>([])

// UI state
const searchQuery = ref('')
const selectedTopicObj = ref<{ id: number; name: string } | null>(null)
const selectedTypeObj = ref<{ id: number; type_name: string } | null>(null)
const showUnverified = ref(false)
const isFilterOpen = ref(false)
const isSearching = ref(false)
const isLoading = ref(true)
const searchInputRef = ref<HTMLInputElement | null>(null)
const sortOption = ref('question_text_asc')
const searchTimeout = ref<number | null>(null)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

// Add this to the script section - new data properties
const expandedQuestions = ref<Set<string>>(new Set());
const questionTextMaxLength = 250; // Characters before truncating
const optionTextMaxLength = 80;  // Characters before truncating for options

// Computed properties to extract IDs from selected objects
const selectedTopic = computed<number | null>(() => selectedTopicObj.value?.id || null)
const selectedType = computed<number | null>(() => selectedTypeObj.value?.id || null)

// Type definitions for sort mappings and type mappings
interface SortOption {
  sort_by: string;
  sort_order: string;
}

// Mapping for sort options to API parameters
const sortMappings: Record<string, SortOption> = {
  'question_text_asc': { sort_by: 'question_text', sort_order: 'asc' },
  'question_text_desc': { sort_by: 'question_text', sort_order: 'desc' },
  'question_type_id_asc': { sort_by: 'question_type_id', sort_order: 'asc' },
  'question_type_id_desc': { sort_by: 'question_type_id', sort_order: 'desc' },
  'created_at_asc': { sort_by: 'created_at', sort_order: 'asc' },
  'created_at_desc': { sort_by: 'created_at', sort_order: 'desc' },
  'updated_at_asc': { sort_by: 'updated_at', sort_order: 'asc' },
  'updated_at_desc': { sort_by: 'updated_at', sort_order: 'desc' }
}

// Computed properties for filtered questions
const filteredVerifiedQuestions = computed(() => verifiedQuestions.value)

const filteredUnverifiedQuestions = computed(() => unverifiedQuestions.value)

// Computed property to determine which page numbers to show
const visiblePageNumbers = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if there are few pages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate start and end of visible pages
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Adjust if we're near the beginning
    if (currentPage.value <= 3) {
      endPage = Math.min(totalPages.value - 1, 4)
    }

    // Adjust if we're near the end
    if (currentPage.value >= totalPages.value - 2) {
      startPage = Math.max(2, totalPages.value - 3)
    }

    // Add ellipsis if needed before visible pages
    if (startPage > 2) {
      pages.push('...')
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed after visible pages
    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
})

// Methods
function handleSearchInput() {
  // Set searching state for visual feedback
  isSearching.value = true;

  // Clear any existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // Set a new timeout
  searchTimeout.value = setTimeout(() => {
    // Reset to first page when search changes
    currentPage.value = 1;
    fetchQuestions();
  }, 500) as unknown as number; // TypeScript type assertion for timer
}

function clearSearch() {
  searchQuery.value = '';
  // Reset to first page when clearing search
  currentPage.value = 1;
  isSearching.value = true; // Set to loading state for visual feedback
  fetchQuestions();

  // Maintain focus on the search input after clearing
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
}

function filterCards() {
  // Reset to first page when filters change
  currentPage.value = 1;
  fetchQuestions();
}

function getTopicsDisplay(question: Question) {
  if (question.topics && question.topics.length > 0) {
    return question.topics.map(topic => topic.name).join(', ')
  }
  return question.topic || ''
}

function toggleFilterIcon() {
  // Toggle the filter state
  isFilterOpen.value = !isFilterOpen.value;

  // Manually toggle the collapse using Bootstrap's Collapse class
  const filterElement = document.getElementById('filter');
  if (filterElement) {
    // Get or create a collapse instance
    let bsCollapse = Collapse.getInstance(filterElement);
    if (!bsCollapse) {
      bsCollapse = new Collapse(filterElement, {
        toggle: false
      });
    }

    // Toggle the collapse
    bsCollapse.toggle();

    // Toggle active class on the filter button
    const filterBtn = document.querySelector('.filter-btn');
    if (filterBtn) {
      if (isFilterOpen.value) {
        filterBtn.classList.add('active');
      } else {
        filterBtn.classList.remove('active');
        // Clear filters when closing
        clearFilters();
      }
    }
  }
}

function clearFilters() {
  // Reset filter values
  selectedTopicObj.value = null;
  selectedTypeObj.value = null;
  // Update filtered results
  filterCards();
}

function editQuestion(question: Question) {
  // Navigate to edit question page with question ID
  router.push({
    name: 'editQuestion',
    params: {
      id: question.id
    }
  })
}

function openRemoveConfirmationModal(index: number, type: 'verified' | 'unverified') {
  createConfirmationModal({
    title: 'Remove Question',
    titleClass: 'bg-warning text-black',
    message: 'Are you sure you want to remove this question from this Chapter?',
    confirmButtonClass: 'btn-warning',
    confirmButtonText: 'Remove',
    onConfirm: () => {
      if (type === 'unverified') {
        // For unverified questions, just delete them
        deleteUnverifiedQuestion(index);
      } else {
        // For verified questions, remove from this chapter
        const question = verifiedQuestions.value[index];
        removeQuestionFromChapter(question.id);
      }
    }
  });
}

function openDeleteConfirmationModal(index: number, type: 'verified' | 'unverified') {
  createConfirmationModal({
    title: 'Delete Question Text',
    titleClass: 'bg-danger text-white',
    message: 'Are you sure you want to delete this question text from the Question Bank? This will not delete the entire question itself.',
    confirmButtonClass: 'btn-danger',
    confirmButtonText: 'Delete',
    onConfirm: () => {
      if (type === 'unverified') {
        deleteUnverifiedQuestion(index);
      } else {
        // For verified questions, delete the question text, not the entire question
        const question = verifiedQuestions.value[index];
        deleteVerifiedQuestion(question, index);
      }
    }
  });
}

function openVerifyConfirmationModal(index: number) {
  createConfirmationModal({
    title: 'Verify Question',
    titleClass: 'bg-success text-black',
    message: 'You want to add this question in the Question Bank?',
    confirmButtonClass: 'btn-success',
    confirmButtonText: 'Yes',
    onConfirm: () => {
      verifyQuestion(index)
    }
  })
}

function createConfirmationModal(options: {
  title: string,
  titleClass: string,
  message: string,
  confirmButtonClass: string,
  confirmButtonText: string,
  onConfirm: () => void
}) {
  // Create modal element
  const modalElement = document.createElement('div')
  modalElement.className = 'modal fade'
  modalElement.id = 'confirmationModal'
  modalElement.setAttribute('tabindex', '-1')
  modalElement.setAttribute('aria-hidden', 'true')
  modalElement.setAttribute('data-bs-backdrop', 'static')
  modalElement.setAttribute('data-bs-keyboard', 'false')

  modalElement.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header ${options.titleClass}">
          <h5 class="modal-title">${options.title}</h5>
        </div>
        <div class="modal-body">
          ${options.message}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" id="cancelButton">Cancel</button>
          <button type="button" class="btn ${options.confirmButtonClass}" id="confirmButton">${options.confirmButtonText}</button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modalElement)

  // Initialize and show modal
  const modal = new Modal(modalElement)
  modal.show()

  // Add event listeners
  document.getElementById('cancelButton')?.addEventListener('click', () => {
    modal.hide()
    setTimeout(() => {
      modalElement.remove()
    }, 300)
  })

  document.getElementById('confirmButton')?.addEventListener('click', () => {
    modal.hide()
    setTimeout(() => {
      modalElement.remove()
      options.onConfirm()
    }, 300)
  })
}

function deleteUnverifiedQuestion(index: number) {
  try {
    // Get the question before removing it
    const question = unverifiedQuestions.value[index];

    // First, fetch the question data to get the question text ID
    axiosInstance.get(`/questions/${question.id}`)
      .then((response) => {
        const questionData = response.data;

        // Make sure there's a question text to delete
        if (questionData.question_texts && questionData.question_texts.length > 0) {
          const questionTextId = questionData.question_texts[0].id;

          // Delete the question text instead of the entire question
          return axiosInstance.delete(`/question-texts/${questionTextId}`);
        } else {
          throw new Error('Question text not found');
        }
      })
      .then(() => {
        // Remove question from unverified questions
        unverifiedQuestions.value.splice(index, 1);

        // Show success toast
        toastTitle.value = 'Success';
        toastMessage.value = 'Question text deleted successfully';
        toastType.value = 'success';
        showToast.value = true;

        // Auto hide toast after 3 seconds
        setTimeout(() => {
          showToast.value = false;
        }, 3000);
      })
      .catch(error => {
        console.error('Error deleting question text:', error);

        // Show error toast
        toastTitle.value = 'Error';
        toastMessage.value = error.response?.data?.message || 'Failed to delete question text';
        toastType.value = 'error';
        showToast.value = true;

        // Auto hide toast after 5 seconds
        setTimeout(() => {
          showToast.value = false;
        }, 5000);
      });
  } catch (error) {
    console.error('Error in deleteUnverifiedQuestion:', error);

    // Show error toast
    toastTitle.value = 'Error';
    toastMessage.value = 'An unexpected error occurred';
    toastType.value = 'error';
    showToast.value = true;

    // Auto hide toast after 5 seconds
    setTimeout(() => {
      showToast.value = false;
    }, 5000);
  }
}

function verifyQuestion(index: number) {
  const question = unverifiedQuestions.value[index];

  // First, fetch the question data to get the necessary details
  axiosInstance.get(`/questions/${question.id}`)
    .then((response) => {
      const questionData = response.data;

      // Make sure there's a question text to verify
      if (questionData.question_texts && questionData.question_texts.length > 0) {
        const questionText = questionData.question_texts[0];
        const questionTextId = questionText.id;

        // Make sure there's a topic associated with the question text
        if (!questionText.topic || !questionText.topic.id) {
          throw new Error('Question topic not found');
        }

        const topicId = questionText.topic.id;

        // Prepare the payload for the verification API
        const payload = {
          question_id: question.id,
          question_text_id: questionTextId,
          topic_id: topicId,
          instruction_medium_id: Number(questionBankData.value.mediumId),
          is_verified: true
        };

        // Call the new verification API endpoint
        return axiosInstance.patch('/question-text-topic-medium/verify', payload);
      } else {
        throw new Error('Question text not found');
      }
    })
    .then((response) => {
      console.log('Question verified successfully:', response.data);

      // Remove from unverified list
      unverifiedQuestions.value.splice(index, 1);

      // Refresh verified questions if we're about to switch to that view
      if (!showUnverified.value) {
        fetchQuestions();
      }

      // Show success toast
      toastTitle.value = 'Success';
      toastMessage.value = response.data?.message || 'Question verified successfully';
      toastType.value = 'success';
      showToast.value = true;

      // Auto hide toast after 3 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    })
    .catch(error => {
      console.error('Error verifying question:', error);

      // Show error toast
      toastTitle.value = 'Error';
      toastMessage.value = error.response?.data?.message || 'Failed to verify question';
      toastType.value = 'error';
      showToast.value = true;

      // Auto hide toast after 5 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 5000);
    });
}

function deleteVerifiedQuestion(question: Question, index: number) {
  // First, fetch the question data to get the question text ID
  axiosInstance.get(`/questions/${question.id}`)
    .then((response) => {
      const questionData = response.data;

      // Make sure there's a question text to delete
      if (questionData.question_texts && questionData.question_texts.length > 0) {
        const questionTextId = questionData.question_texts[0].id;

        // Delete the question text instead of the entire question
        return axiosInstance.delete(`/question-texts/${questionTextId}`);
      } else {
        throw new Error('Question text not found');
      }
    })
    .then(() => {
      // Remove question from verified questions list
      verifiedQuestions.value.splice(index, 1);

      // Show success toast
      toastTitle.value = 'Success';
      toastMessage.value = 'Question text deleted successfully';
      toastType.value = 'success';
      showToast.value = true;

      // Auto hide toast after 3 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    })
    .catch(error => {
      console.error('Error deleting question text:', error);

      // Show error toast
      toastTitle.value = 'Error';
      toastMessage.value = error.response?.data?.message || 'Failed to delete question text';
      toastType.value = 'error';
      showToast.value = true;

      // Auto hide toast after 5 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 5000);
    });
}

function removeQuestionFromChapter(questionId: number) {
  // Make API call to remove the question from this chapter
  // The exact endpoint would depend on your API structure
  axiosInstance.delete(`/questions/${questionId}/chapter/${questionBankData.value.chapterId}`)
    .then(() => {
      // Refresh questions after removal
      // This will apply all filters including instruction_medium_id
      fetchQuestions();

      // Show success toast
      toastTitle.value = 'Success';
      toastMessage.value = 'Question removed from chapter successfully';
      toastType.value = 'success';
      showToast.value = true;

      // Auto hide toast after 3 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    })
    .catch(error => {
      console.error('Error removing question from chapter:', error);

      // Show error toast
      toastTitle.value = 'Error';
      toastMessage.value = error.response?.data?.message || 'Failed to remove question from chapter';
      toastType.value = 'error';
      showToast.value = true;

      // Auto hide toast after 5 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 5000);
    });
}

// Add a watch for showUnverified to refetch questions when toggle changes
watch(showUnverified, () => {
  fetchQuestions()
})

// Add watcher to maintain focus after search completes
watch(isSearching, (newVal) => {
  // If we were searching and now we're done, restore focus to search input
  if (!newVal && searchInputRef.value) {
    searchInputRef.value.focus();
  }
});

// Function to change page
function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchQuestions()
}

// Update fetchQuestions to handle loading states properly
async function fetchQuestions() {
  try {
    // Set appropriate loading state
    if (searchQuery.value || selectedTopic.value || selectedType.value) {
      isSearching.value = true;
    } else {
      isLoading.value = true;
    }

    // Prepare query parameters
    const params: Record<string, string | number | boolean> = {
      chapter_id: questionBankData.value.chapterId,
      instruction_medium_id: questionBankData.value.mediumId,
      is_verified: !showUnverified.value, // true for verified, false for unverified
      page: currentPage.value,
      page_size: pageSize.value
    };

    // Add sort parameters
    if (sortOption.value && sortMappings[sortOption.value]) {
      params.sort_by = sortMappings[sortOption.value].sort_by;
      params.sort_order = sortMappings[sortOption.value].sort_order;
    }

    // Add search parameter if provided
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    // Add topic filter if selected
    if (selectedTopic.value) {
      params.topic_id = selectedTopic.value;
    }

    // Add question type filter if selected
    if (selectedType.value) {
      params.question_type_id = selectedType.value;
    }

    // Make the API call with all parameters
    const response = await axiosInstance.get('/questions', { params })
      .catch((error) => {
        console.error('Error fetching questions:', error);
        return { data: { data: [], meta: { total_count: 0, total_pages: 0 } } };
      });

    // Handle paginated response
    if (response.data && response.data.data) {
      // Update pagination data - updated to match new meta structure
      if (response.data.meta) {
        totalItems.value = response.data.meta.total_count || 0;
        totalPages.value = response.data.meta.total_pages || 1;
      }

      // Transform API response to match our component's expected structure
      const questions = response.data.data.map((apiQuestion: ApiQuestion) => {
        // Get the first question text (assuming there's at least one)
        const questionText = apiQuestion.question_texts.length > 0
          ? apiQuestion.question_texts[0].question_text
          : '';

        // Get image ID and presigned URL if available
        let imageId = null;
        let imageUrl = null;

        if (apiQuestion.question_texts.length > 0 &&
            apiQuestion.question_texts[0].image_id &&
            apiQuestion.question_texts[0].image) {
          imageId = apiQuestion.question_texts[0].image_id;
          imageUrl = apiQuestion.question_texts[0].image.presigned_url;
        }

        // Extract topic from question_text instead of question_topics
        const questionTopics = [];
        if (apiQuestion.question_texts.length > 0 && apiQuestion.question_texts[0].topic) {
          const topicData = apiQuestion.question_texts[0].topic;
          questionTopics.push({
            id: topicData.id,
            name: topicData.name
          });

          // Add to our topics collection if not already present
          if (!topics.value.some(t => t.id === topicData.id)) {
            topics.value.push({
              id: topicData.id,
              name: topicData.name
            });
          }
        }

        // Handle MCQ options if present
        let options = undefined;
        let correctOptionIndex = undefined;
        if (apiQuestion.question_type.type_name === 'Multiple Choice Question (MCQ)' &&
            apiQuestion.question_texts.length > 0 &&
            apiQuestion.question_texts[0].mcq_options.length > 0) {
          options = apiQuestion.question_texts[0].mcq_options.map(opt => opt.option_text);
          correctOptionIndex = apiQuestion.question_texts[0].mcq_options.findIndex(opt => opt.is_correct);
          if (correctOptionIndex === -1) correctOptionIndex = undefined;
        }

        // Handle match pairs if present
        let lhs = undefined;
        let rhs = undefined;
        if (apiQuestion.question_type.type_name === 'Match the Pairs' &&
            apiQuestion.question_texts.length > 0 &&
            apiQuestion.question_texts[0].match_pairs &&
            apiQuestion.question_texts[0].match_pairs.length > 0) {

          // Add detailed debug logging for Match the Pairs
          console.log('Match the Pairs question found:', apiQuestion.id);
          console.log('Match Pairs data:', apiQuestion.question_texts[0].match_pairs);

          lhs = apiQuestion.question_texts[0].match_pairs.map(pair => pair.left_text);
          rhs = apiQuestion.question_texts[0].match_pairs.map(pair => pair.right_text);

          console.log('Extracted LHS:', lhs);
          console.log('Extracted RHS:', rhs);
        }

        return {
          id: apiQuestion.id,
          question: questionText,
          type: apiQuestion.question_type.type_name,
          typeId: apiQuestion.question_type.id,
          topics: questionTopics,
          options: options,
          correctOptionIndex: correctOptionIndex,
          lhs: lhs,
          rhs: rhs,
          isPreviousExam: apiQuestion.board_question,
          isVerified: apiQuestion.is_verified ?? !showUnverified.value,
          imageId: imageId,
          imageUrl: imageUrl,
          imageLoading: imageId !== null && imageUrl === null,
          imageError: false,
          imageLoadingState: imageUrl !== null
        };
      });

      // Update the appropriate questions array based on verification status
      if (showUnverified.value) {
        unverifiedQuestions.value = questions;
      } else {
        verifiedQuestions.value = questions;
      }
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
  } finally {
    // Always clear the loading states when done, regardless of success or failure
    isSearching.value = false;
    isLoading.value = false;
  }
}

// Handle image load events
function handleImageLoad(question: Question) {
  question.imageLoading = false;
  question.imageLoadingState = false;
  question.imageError = false;
  console.log(`Image loaded successfully for question ${question.id}`);
}

// Handle image error events
function handleImageError(question: Question) {
  console.error(`Failed to load image for question ${question.id}`);
  console.error('Image URL:', question.imageUrl);
  question.imageLoading = false;
  question.imageLoadingState = false;
  question.imageError = true;
}

// Close toast function
const closeToast = () => {
  showToast.value = false
}

// Lifecycle hooks
onMounted(() => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank')
  if (storedData) {
    questionBankData.value = JSON.parse(storedData)
    // Initial data loading
    isLoading.value = true
    fetchQuestions()
    // Fetch question types
    fetchQuestionTypes()
  } else {
    // Redirect to question bank selection if no data
    router.push({ name: 'questionBank' })
  }

  // Check if the filter element has the 'show' class initially
  const filterElement = document.getElementById('filter')
  if (filterElement) {
    // Check if the element has the 'show' class initially
    if (filterElement.classList.contains('show')) {
      isFilterOpen.value = true

      // Update filter button appearance
      const filterBtn = document.querySelector('.filter-btn')
      if (filterBtn) {
        filterBtn.classList.add('active')
      }
    } else {
      isFilterOpen.value = false
    }
  }

  // Check for success message in route query params
  if (route.query.success === 'true') {
    const message = route.query.message as string || 'Operation completed successfully'

    toastStore.showToast({
      title: 'Success',
      message: message,
      type: 'success'
    })

    // Remove query parameters without page reload
    router.replace({ query: {} }).catch(() => {
      // Ignore navigation errors
    })
  }
})

// Function to fetch question types from API
async function fetchQuestionTypes() {
  try {
    const response = await axiosInstance.get('/question-types');
    if (response.data) {
      questionTypes.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching question types:', error);
  }
}

// Add these functions to handle text truncation and expansion
function isQuestionExpanded(questionId: number, section: string): boolean {
  return expandedQuestions.value.has(`${questionId}-${section}`);
}

function toggleExpand(questionId: number, section: string): void {
  const key = `${questionId}-${section}`;
  if (expandedQuestions.value.has(key)) {
    expandedQuestions.value.delete(key);
  } else {
    expandedQuestions.value.add(key);
  }
}

function shouldTruncateQuestion(text: string): boolean {
  return text.length > questionTextMaxLength;
}

function shouldTruncateOption(text: string): boolean {
  return text.length > optionTextMaxLength;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}

/* Default styles for screens above 576px */
.dynamic-style {
  position: static;
  background-color: transparent;
  box-shadow: none;
}

/* Styles for screens below 576px */
@media (max-width: 576px) {
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 1000;
  }

  #addButton {
    width: 100%;
  }
}

/* Styles for nav link */
#navQuestion {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navQuestion {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.card.border-0 {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.collapse {
  transition: all 0.3s ease-out;
}

.input-group-text {
  transition: background-color 0.2s ease;
}

.input-group-text:hover {
  background-color: #e9ecef;
}

/* Modern search styling */
.search-field {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
  pointer-events: none;
}

.search-input {
  padding-left: 40px;
  padding-right: 40px;
  height: 48px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #86b7fe;
  outline: 0;
}

.clear-search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 10;
}

.clear-search-icon:hover {
  color: #212529;
}

/* Sort dropdown styling */
.sort-select {
  height: 48px;
  padding-right: 40px;
  border-radius: 6px;
  appearance: none;
  background-image: none;
  transition: all 0.3s ease;
}

.sort-select:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #86b7fe;
  outline: 0;
}

/* Filter button styling */
.filter-btn {
  height: 48px;
  min-width: 48px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 0;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
}

.filter-btn:hover {
  background-color: #e9ecef;
  color: #212529;
}

.filter-btn:focus {
  box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.25);
  outline: 0;
}

.filter-btn.active {
  background-color: #212529;
  color: white;
  border-color: #212529;
}

.filter-btn.active:hover {
  background-color: #343a40;
  color: white;
}

/* Improved spinner animation */
@keyframes spin {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}

.search-loading-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .search-input,
  .sort-select,
  .filter-btn {
    height: 42px;
  }

  /* Adjust flex layout for mobile */
  .d-flex.gap-2 {
    flex-wrap: wrap;
  }

  .search-field {
    flex: 1 0 100%;
    margin-bottom: 0.5rem;
  }

  .sort-field {
    flex: 1 1 auto;
    min-width: 0 !important;
  }
}

/* Pagination styling */
.pagination .page-item.active .page-link {
  background-color: #212529 !important;
  border-color: #212529 !important;
  color: white !important;
}

.pagination .page-link {
  color: #212529;
}

.pagination .page-link:focus {
  box-shadow: none;
  outline: none;
}

/* Search loading overlay */
.search-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  backdrop-filter: blur(2px);
}

.card-searching {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

/* Loading spinner styling */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

.spinner-border-sm {
  width: 1.5rem;
  height: 1.5rem;
}

/* Question image styling */
.question-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 200px;
  background-color: #f8f9fa;
}

.question-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.image-error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #dc3545;
  text-align: center;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-error-message i {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .question-image {
    max-height: 200px;
  }

  .question-image-container {
    min-height: 150px;
  }
}

/* Question image loading container */
.question-image-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .question-image-loading-container {
    height: 150px;
  }
}

/* Question image container with loading overlay */
.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(248, 249, 250, 0.7);
  z-index: 5;
}

/* MCQ Options Styling */
.option-letter {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #212529;
  text-align: center;
  font-weight: 600;
  line-height: 22px;
  font-size: 0.85rem;
}

.option-text {
  line-height: 1.4;
}

.option-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.option-card:hover {
  background-color: #e9ecef;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.option-card.option-correct {
  background-color: #e8f5e9;
  border-color: #81c784;
}

.option-card.option-correct:hover {
  background-color: #c8e6c9;
}

.option-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #212529;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
}

.option-circle-correct {
  background-color: #43a047;
}

.option-correct-icon {
  font-size: 1.2rem;
}

.btn-link {
  color: #007bff;
  font-size: 0.85rem;
  text-decoration: none;
  padding: 0 0.25rem;
  vertical-align: middle;
}

.btn-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* Improve card spacing and mobile responsiveness */
.card {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.5rem;
}

/* Adjustments for mobile view */
@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }

  .option-text {
    font-size: 0.95rem;
  }

  .btn-link {
    font-size: 0.8rem;
  }

  .matching-table {
    font-size: 0.9rem;
  }

  .card-text {
    font-size: 0.95rem;
  }

  .mcq-title .badge, .match-title .badge {
    font-size: 0.75rem;
  }
}

/* Styling for Fill in the Blanks */
.fillblanks-container {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

.blanks-question {
  line-height: 1.8;
}

.blank-placeholder {
  display: inline-block;
  min-width: 100px;
  height: 2px;
  background-color: #212529;
  position: relative;
  top: -3px;
  margin: 0 5px;
  padding: 0 10px;
}

/* Styling for One-Word Answer */
.oneword-container {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

.correct-answer-container {
  display: flex;
  align-items: center;
}

.answer-label {
  font-weight: bold;
  margin-right: 10px;
  color: #6c757d;
}

.answer-value {
  font-weight: 500;
  padding: 5px 15px;
  background-color: #e8f4f8;
  border-radius: 4px;
  border-left: 3px solid #0d6efd;
}

/* Short Answer Question styling */
.shortanswer-container {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

/* Styling for Odd One Out */
.odd-one-out-container .option-correct {
  background-color: rgba(217, 234, 211, 0.7);
  border-color: #75b798;
}

.odd-one-out-container .option-correct:hover {
  background-color: rgba(217, 234, 211, 0.9);
}

/* Styling for Complete the Correlation */
.correlation-container {
  overflow-x: auto;
}

.correlation-table {
  border-collapse: separate;
  border-spacing: 0;
}

.correlation-item {
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #6c757d;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
}

.correlation-item:hover {
  background-color: #e9ecef;
}

.correlation-highlight {
  border-left: 3px solid #28a745;
  background-color: rgba(217, 234, 211, 0.7);
}

.correlation-highlight:hover {
  background-color: rgba(217, 234, 211, 0.9);
}

.correlation-arrow {
  font-size: 1.25rem;
  color: #6c757d;
}

.correlation-number {
  font-weight: 500;
  background-color: #f8f9fa;
}

/* Match the Pairs Styling */
.match-pairs-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-pair-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.match-pair-item {
  flex: 1;
}

.match-pair-arrow {
  margin: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  min-width: 30px;
}

.match-arrow-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .match-pair-row {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .match-pair-arrow {
    align-self: center;
    transform: rotate(90deg);
    margin: 0.25rem 0;
  }
}
</style>

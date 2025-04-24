import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import BoardDashboard from '@/views/admin/board/BoardDashboard.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import FormLayout from '@/layouts/FormLayout.vue'
import LoginLayout from '@/layouts/LoginLayout.vue'
import EditChapter from '@/views/admin/syllabus/subject/EditChapter.vue'
import LoginHomepage from '@/views/login/LoginHomepage.vue'
import ForgetPassword from '@/views/login/ForgetPassword.vue'
import ResetPassword from '@/views/login/ResetPassword.vue'
import ChangePassword from '@/views/login/ChangePassword.vue'
import AdminProfile from '@/views/admin/profile/AdminProfile.vue'
import TeacherProfile from '@/views/teacher/profile/TeacherProfile.vue'
import { useAuthStore } from '@/stores/auth'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/change-password']

// Update the route meta type
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginHomepage,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'forgotPassword',
    component: ForgetPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: ResetPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/change-password',
    name: 'changePassword',
    component: ChangePassword,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/login',
    meta: { requiresAuth: false },
  },
  // Dashboard routes with navbar
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: 'board',
        name: 'board',
        component: BoardDashboard,
      },
      {
        path: 'school',
        name: 'SchoolDashboard',
        component: () => import('../views/admin/school/SchoolDashboard.vue'),
      },
      {
        path: 'teacher',
        name: 'TeacherDashboard',
        component: () => import('../views/admin/teacher/TeacherDashboard.vue'),
      },
      {
        path: 'syllabus',
        name: 'SyllabusDashboard',
        component: () => import('../views/admin/syllabus/SyllabusDashboard.vue'),
      },
      {
        path: 'syllabus/standard',
        name: 'syllabusStandard',
        component: () => import('@/views/admin/syllabus/Standard/StandardDashboard.vue'),
      },
      {
        path: 'syllabus/subject/:id',
        name: 'subjectSyllabus',
        component: () => import('@/views/admin/syllabus/subject/SubjectDashboard.vue'),
      },
      {
        path: 'pattern',
        name: 'patternDashboard',
        component: () => import('@/views/admin/pattern/PatternDashboard.vue'),
      },
      {
        path: 'profile',
        name: 'adminProfile',
        component: AdminProfile,
      },
      {
        path: 'questionBank',
        name: 'questionBank',
        component: () => import('@/views/admin/questionBank/Questionbank.vue'),
      },
      {
        path: 'questionBank/dashboard',
        name: 'questionDashboard',
        component: () => import('@/views/admin/questionBank/QuestionDashboard.vue'),
      },
      {
        path: 'questionBank/add',
        name: 'addQuestion',
        component: () => import('@/views/admin/questionBank/AddQuestion.vue'),
      },
      {
        path: 'questionBank/translation',
        name: 'translationPending',
        component: () => import('../views/admin/questionBank/TranslationPending.vue'),
      },
    ],
  },
  // Form routes without navbar
  {
    path: '/admin',
    component: FormLayout,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: 'board/add',
        name: 'addBoard',
        component: () => import('@/views/admin/board/AddBoard.vue'),
      },
      {
        path: 'board/:id/edit',
        name: 'editBoard',
        component: () => import('@/views/admin/board/EditBoard.vue'),
      },
      {
        path: 'school/add',
        name: 'addSchool',
        component: () => import('@/views/admin/school/AddSchool.vue'),
      },
      {
        path: 'school/:id/edit',
        name: 'editSchool',
        component: () => import('@/views/admin/school/EditSchool.vue'),
      },
      {
        path: 'teacher/add',
        name: 'addTeacher',
        component: () => import('@/views/admin/teacher/AddTeacher.vue'),
      },
      {
        path: 'teacher/:id/edit',
        name: 'editTeacher',
        component: () => import('@/views/admin/teacher/EditTeacher.vue'),
      },
      {
        path: 'syllabus/subject/:id/add-chapter',
        name: 'addChapter',
        component: () => import('@/views/admin/syllabus/subject/AddChapter.vue'),
      },
      {
        path: 'questionBank/edit/:id',
        name: 'editQuestion',
        component: () => import('@/views/admin/questionBank/EditQuestion.vue'),
      },
      // Pattern routes
      {
        path: 'pattern/add',
        name: 'createPattern',
        component: () => import('@/views/admin/pattern/AddPattern.vue'),
      },
      {
        path: 'pattern/:id/edit',
        name: 'editPattern',
        component: () => import('@/views/admin/pattern/EditPattern.vue'),
      },
      {
        path: 'pattern/section/add',
        name: 'addSection',
        component: () => import('@/views/admin/pattern/AddSection.vue'),
      },
      {
        path: 'pattern/section/edit',
        name: 'editSection',
        component: () => import('@/views/admin/pattern/EditSection.vue'),
      },
      // Add Translation route
      {
        path: 'questionBank/translation/:id',
        name: 'addTranslation',
        component: () => import('@/views/admin/questionBank/AddTranslation.vue'),
      },
      // Edit Translation route
      {
        path: 'questionBank/translation/:id/edit',
        name: 'editTranslation',
        component: () => import('@/views/admin/questionBank/EditTranslation.vue'),
      },
    ],
  },
  {
    path: '/admin/syllabus/chapter/:id/edit',
    name: 'editChapter',
    component: EditChapter,
    meta: {
      requiresAuth: true,
      roles: ['ADMIN'],
    },
  },
  // Teacher routes
  {
    path: '/teacher',
    component: LoginLayout,
    meta: { requiresAuth: true, roles: ['TEACHER'] },
    children: [
      {
        path: '',
        redirect: { name: 'teacherHome' },
      },
      {
        path: 'home',
        name: 'teacherHome',
        component: () => import('@/views/teacher/home/TeacherHome.vue'),
      },
      {
        path: 'profile',
        name: 'teacherProfile',
        component: TeacherProfile,
      },
      {
        path: 'syllabus',
        name: 'teacherSyllabus',
        component: () => import('@/views/teacher/syllabus/ViewSyllabusDashboard.vue'),
      },
      {
        path: 'syllabus/view',
        name: 'viewSyllabusDetail',
        component: () => import('@/views/teacher/syllabus/ViewSyllabus.vue'),
      },
      {
        path: 'create-test-paper',
        name: 'createTestPaper',
        component: () => import('@/views/teacher/createTestPaper/createTestPaperDashboard.vue'),
      },
      {
        path: 'select-test-pattern',
        name: 'selectTestPattern',
        component: () => import('@/views/teacher/createTestPaper/selectPattern.vue'),
      },
      {
        path: 'previous-test-paper',
        name: 'previousTestPaper',
        component: () => import('@/views/teacher/previousTestPaper/PreviousTestPaperDashboard.vue'),
      },
      {
        path: 'create-test-paper-detail',
        name: 'createTestPaperDetail',
        // This component would need to be created in a future task
        component: () => import('@/views/teacher/createTestPaper/createTestPaperDetail.vue'),
      },
      {
        path: 'test-paper-preview',
        name: 'testPaperPreview',
        component: () => import('@/views/teacher/createTestPaper/testPaperPreview.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Add a router.afterEach hook that does nothing for now
// We can re-enable logging when needed
router.afterEach(() => {
  // Logging disabled
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = await authStore.checkAuth()
  const userRole = authStore.userRole

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // Check role requirements
    if (to.meta.roles && userRole && !to.meta.roles.includes(userRole)) {
      // User's role is not authorized
      next({ name: 'login' })
      return
    }
  } else if (isAuthenticated && publicRoutes.includes(to.path)) {
    // If user is authenticated and tries to access public routes like login
    next({ path: '/admin/board' })
    return
  }

  next()
})

export default router

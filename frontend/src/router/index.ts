import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import BoardDashboard from '@/views/admin/board/BoardDashboard.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import FormLayout from '@/layouts/FormLayout.vue'
import EditChapter from '@/views/admin/syllabus/subject/EditChapter.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/admin/board',
  },
  // Dashboard routes with navbar
  {
    path: '/admin',
    component: AdminLayout,
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
    ],
  },
  // Form routes without navbar
  {
    path: '/admin',
    component: FormLayout,
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
    ],
  },
  {
    path: '/admin/syllabus/chapter/:id/edit',
    name: 'editChapter',
    component: EditChapter,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

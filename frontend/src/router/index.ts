import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import BoardDashboard from '@/views/admin/board/BoardDashboard.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/admin/board',
  },
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
    ],
  },
  {
    path: '/admin/board/add',
    name: 'addBoard',
    component: () => import('@/views/admin/board/AddBoard.vue'),
  },
  {
    path: '/admin/board/:id/edit',
    name: 'editBoard',
    component: () => import('@/views/admin/board/EditBoard.vue'),
  },
  {
    path: '/admin/school/add',
    name: 'addSchool',
    component: () => import('@/views/admin/school/AddSchool.vue'),
  },
  {
    path: '/admin/school/:id/edit',
    name: 'editSchool',
    component: () => import('@/views/admin/school/EditSchool.vue'),
  },
  {
    path: '/admin/teacher/add',
    name: 'addTeacher',
    component: () => import('@/views/admin/teacher/AddTeacher.vue'),
  },
  {
    path: '/admin/teacher/:id/edit',
    name: 'editTeacher',
    component: () => import('@/views/admin/teacher/EditTeacher.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

import { FireOutlined } from '@ant-design/icons'
import { combine, createStore } from 'effector'

import { MainPage } from 'pages/Main'
import { Profile } from 'pages/Profile'

import { AppRoutes } from 'shared/config'

import type { IRoute, ITab } from './types'

export const $routes = createStore<IRoute[]>([
  {
    path: AppRoutes.Main.path,
    Component: <MainPage />,
    title: 'Техника',
    showMenu: true,
  },
  {
    path: AppRoutes.Profile.path,
    Component: <Profile />,
    title: 'Профиль',
    canGoBack: true,
    showMenu: false,
  },
])

export const $allTabs = createStore<ITab[]>([
  {
    path: AppRoutes.Main.path,
    text: 'Главная',
    icon: FireOutlined,
  },
  {
    path: AppRoutes.Profile.path,
    text: 'Профиль',
    icon: FireOutlined,
  },
])

// фильтруем табы здесь если нужно
export const $pageHeaderTabs = combine<ITab[], ITab[]>($allTabs, (tabs) => tabs)

// фильтруем роуты если нужно
export const $availableRoutes = combine<IRoute[], IRoute[]>(
  $routes,
  (routes) => {
    return routes
  },
)

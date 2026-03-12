import React from 'react'

import { useUnit } from 'effector-react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { stores } from 'entities/auth'

import { MainLayout, getTabKey } from '../layouts'
import { $availableRoutes, $pageHeaderTabs } from './routes'
import { type MenuItem } from './types'

export const Router = () => {
  const routes = useUnit($availableRoutes)
  const token = useUnit(stores.$tokenData)
  const location = useLocation()

  const tabs: MenuItem[] = useUnit($pageHeaderTabs).map((tab, index) => ({
    path: tab.path,
    key: getTabKey(index),
    icon: tab?.icon && React.createElement(tab.icon),
    title: tab.text,
    label: <Link to={tab.path}>{tab.text}</Link>,
  }))

  const currentRoute =
    routes.find((route) => route.path === location.pathname) ?? routes[0]

  return (
    <MainLayout
      menuItems={tabs}
      isLoading={!token}
      shellMeta={{
        title: currentRoute?.title ?? 'Horsch',
        canGoBack: currentRoute?.canGoBack,
        showMenu: currentRoute?.showMenu,
      }}
    >
      <Routes>
        {routes.map(({ path, Component }) => (
          <Route key={path} path={path} element={Component} />
        ))}

        {!!routes.length && (
          <Route path="*" element={<Navigate to={routes[0].path} replace />} />
        )}
      </Routes>
    </MainLayout>
  )
}

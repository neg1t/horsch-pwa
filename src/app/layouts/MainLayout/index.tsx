import React, { useEffect, useState } from 'react'

import { LeftOutlined, MenuOutlined } from '@ant-design/icons'
import { Badge, Button, Drawer, Typography, theme } from 'antd'
import type { MenuItem, RouteShellMeta } from 'app/router/types'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'

import logo from 'shared/assets/full-logo.svg'
import { PageLoader } from 'shared/ui/PageLoader'

export function getTabKey(key: number): React.Key {
  return key + 1
}

// type MenuItem = {
//   key: React.Key
//   path: string
//   title?: string
//   label?: React.ReactNode
// }

type MainLayoutProps = {
  menuItems: MenuItem[]
  isLoading: boolean
  shellMeta: RouteShellMeta
}
export function MainLayout({
  children,
  isLoading,
  menuItems,
  shellMeta,
}: React.PropsWithChildren<MainLayoutProps>) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const {
    token: { colorBgContainer, colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()

  useEffect(() => {
    setIsDrawerOpen(false)
  }, [location.pathname])

  const title = shellMeta.title || 'Horsch'
  const showBackButton = Boolean(shellMeta.canGoBack)

  const drawerItems = menuItems.map((item) => {
    const isActive = item.path === location.pathname

    return (
      <Link
        key={item.key}
        to={item.path}
        className={[
          'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
          isActive
            ? 'border-[#d83f2e] bg-[#fff1ee] text-[#b93a2d]'
            : 'border-[#e7e2dc] bg-white text-[#24211d] hover:border-[#d7cdc3]',
        ].join(' ')}
      >
        <span>{item.title ?? item.label}</span>
      </Link>
    )
  })

  return (
    <>
      <CSSTransition
        in={isLoading}
        timeout={500}
        classNames="modal-transition"
        unmountOnExit
      >
        <PageLoader logo={<img src={logo} alt="Logo" />} />
      </CSSTransition>
      <div className="min-h-svh bg-[#d8d8d8] px-0 text-[#24211d] sm:px-6">
        <div className="mx-auto flex min-h-svh w-full max-w-105 flex-col ">
          <header className="sticky top-0 z-20 pt-4 border-b border-[#F7F7F7] bg-[#F7F7F7]/95 px-4 pb-4 backdrop-blur">
            <div className="flex items-center justify-between pb-1">
              <img src={logo} alt="Horsch" className="h-4 w-auto shrink-0" />

              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] text-[#5d5852]">
                <Badge status="processing" color="#75bf72" />
                {/* //todo добавить processing только когда online  */}
                Онлайн
              </span>

              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setIsDrawerOpen(true)}
                className="h-8! w-8! min-w-8! rounded-xl! border! border-[#ddd6cd]! bg-white! text-[#3b3631]! shadow-none"
                aria-label="Открыть меню"
              />
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <div className="flex min-w-16 items-center justify-start">
                {showBackButton && (
                  <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => {
                      void navigate(-1)
                    }}
                    className="px-0!"
                  >
                    Назад
                  </Button>
                )}
              </div>

              <Typography.Title
                level={4}
                className="m-0! text-center  font-semibold! leading-[1.15]! tracking-[-0.03em]! text-[#141414]!"
              >
                {title}
              </Typography.Title>

              <div className="min-w-16" />
            </div>
          </header>

          <main
            className="flex-1 overflow-y-auto px-3 pb-6 pt-3"
            style={{
              background: colorBgContainer,
              scrollbarColor: '#d83f2e transparent',
              scrollbarWidth: 'thin',
            }}
          >
            {children}
          </main>

          <div
            className="border-t px-4 py-3 text-center text-[11px] text-[#F7F7F7] bg-[#F7F7F7]/95"
            style={{
              borderColor: colorBorderSecondary,
              color: colorTextSecondary,
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
            }}
          >
            Версия {import.meta.env.VITE_VERSION}
          </div>
        </div>
      </div>

      <Drawer
        title="Навигация"
        placement="right"
        width={320}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        // closable={false}
        styles={{
          body: {
            background: '#F7F7F7',
            padding: 16,
          },
          header: {
            background: '#F7F7F7',
            borderBottom: '1px solid #F7F7F7',
            padding: '16px',
          },
        }}
      >
        <div className="flex flex-col gap-3">{drawerItems}</div>
      </Drawer>
    </>
  )
}

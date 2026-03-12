import React from 'react'

import { ConfigProvider } from 'antd'

import { themeConfig } from 'shared/config'

export function ThemeProvider({ children }: React.PropsWithChildren) {
  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
}

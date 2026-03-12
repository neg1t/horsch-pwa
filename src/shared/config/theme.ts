import type { ThemeConfig } from 'antd'

const token: ThemeConfig['token'] = {
  colorPrimary: '#c31727',
  colorInfo: '#c31727',
  // colorBgLayout: '#d8d8d8',
  // colorBgContainer: '#f3f1ed',
  // colorBorderSecondary: '#e7e2dc',
  borderRadius: 16,
  borderRadiusLG: 22,
  // fontFamily: `'Segoe UI', 'Helvetica Neue', sans-serif`,
}

const components: ThemeConfig['components'] = {
  Button: {
    // controlHeight: 44,
    // borderRadius: 14,
    borderRadius: 10,
  },
  Card: {
    borderRadiusLG: 22,
  },
  // Drawer: {
  // colorBgElevated: '#f7f4ef',
  // },
  Input: {
    controlHeight: 44,
    borderRadius: 14,
  },
  Menu: {
    // itemSelectedColor: '#d9503b',
  },
  Typography: {
    titleMarginBottom: 0,
  },
}

export const themeConfig: ThemeConfig = {
  token,
  components,
}

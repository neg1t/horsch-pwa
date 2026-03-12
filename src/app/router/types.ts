import { type JSX } from 'react'

import { type VideoCameraOutlined } from '@ant-design/icons'
import { type MenuProps } from 'antd'

export interface IRoute {
  path: string
  Component: JSX.Element
  title: string
  canGoBack?: boolean
  showMenu?: boolean
}

export interface ITab {
  text: string
  path: string
  icon?: typeof VideoCameraOutlined
}

export type MenuItem = Required<MenuProps>['items'][number] & {
  path: string
  title: string
  label: JSX.Element
}

export type RouteShellMeta = Pick<IRoute, 'title' | 'canGoBack' | 'showMenu'>

import type { PropsWithChildren } from 'react'

type MobilePageProps = PropsWithChildren

export function MobilePage({ children }: MobilePageProps) {
  return <section className="flex flex-col gap-4 pb-4">{children}</section>
}

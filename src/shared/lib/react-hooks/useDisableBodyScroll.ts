import { useEffect } from 'react'

export const useDisableBodyScroll = (condition: boolean) => {
  useEffect(() => {
    const body = document.querySelector('body')

    if (body) {
      body.style.overflow = condition ? 'hidden' : 'visible'
    }
  }, [condition])
}

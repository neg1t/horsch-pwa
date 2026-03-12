import React, { useEffect } from 'react'

export const useComponentWillUnmount = (cleanupCallback: VoidFunction) => {
  const callbackRef = React.useRef(cleanupCallback)

  callbackRef.current = cleanupCallback

  useEffect(() => {
    return () => callbackRef.current()
  }, [])
}

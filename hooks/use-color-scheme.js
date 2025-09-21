import { useEffect, useState } from 'react'

export function useColorScheme() {
  const [scheme, setScheme] = useState('light')
  useEffect(() => {
    // minimal fallback
    setScheme('light')
  }, [])
  return scheme
}

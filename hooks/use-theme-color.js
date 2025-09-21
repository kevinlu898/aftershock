import { useMemo } from 'react'
import { useColorScheme as _useColorScheme } from 'react-native'
import * as theme from '../constants/theme'

export function useThemeColor(props, colorName) {
  const scheme = _useColorScheme() || 'light'
  const colorFromProps = props[scheme]
  if (colorFromProps) return colorFromProps
  return theme.Colors[scheme][colorName]
}

export function useThemeColorHook() {
  return useMemo(() => ({ Colors: theme.Colors }), [])
}

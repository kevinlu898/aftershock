import React from 'react'
import { Text } from 'react-native'
import { useThemeColor } from '../hooks/use-theme-color'

export default function ThemedText(props) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
  return <Text style={[{ color }, style]} {...otherProps} />
}

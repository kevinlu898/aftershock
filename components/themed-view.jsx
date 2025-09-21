import React from 'react'
import { View } from 'react-native'
import { useThemeColor } from '../hooks/use-theme-color'

export default function ThemedView(props) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background')
  return <View style={[{ backgroundColor }, style]} {...otherProps} />
}

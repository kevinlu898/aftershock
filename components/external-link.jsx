import * as Linking from 'expo-linking'
import { Pressable, Text } from 'react-native'

export default function ExternalLink({ href, children, ...props }) {
  return (
    <Pressable onPress={() => Linking.openURL(href)} {...props}>
      <Text>{children}</Text>
    </Pressable>
  )
}

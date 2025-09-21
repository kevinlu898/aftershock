import { Text } from 'react-native'

export default function IconSymbolIOS({ name, size = 16, ...props }) {
  return <Text style={{ fontSize: size }} {...props}>{name}</Text>
}

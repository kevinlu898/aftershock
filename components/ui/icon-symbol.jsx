import { Text } from 'react-native'

export default function IconSymbol({ name, size = 16, ...props }) {
  return <Text style={{ fontSize: size }} {...props}>{name}</Text>
}

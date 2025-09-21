import * as Haptics from 'expo-haptics'
import { Text, TouchableOpacity } from 'react-native'

export default function HapticTab({ onPress, children, ...props }) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.selectionAsync()
        if (onPress) onPress()
      }}
      {...props}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  )
}

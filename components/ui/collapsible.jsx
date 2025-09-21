import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Text>{title}</Text>
      </TouchableOpacity>
      {open && <View>{children}</View>}
    </View>
  )
}

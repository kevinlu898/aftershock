import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import IconSymbol from './components/ui/icon-symbol'
import AccountCreation from './screens/AccountCreation'
import Dashboard from './screens/Dashboard'
import Home from './screens/Home'
import Login from './screens/Login'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const TAB_ICONS = {
  Home: 'home',
  Dashboard: 'home',

}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size }) => {
          const iconName = TAB_ICONS[route.name] || route.name.toLowerCase()
          return <IconSymbol name={iconName} color={color} size={size ?? 20} />
        },
      })}
    >
  <Tab.Screen name="Home" component={Home} />
  <Tab.Screen name="Dashboard" component={Dashboard} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={MainTabs} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="AccountCreation" component={AccountCreation} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

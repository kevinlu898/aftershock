import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Dashboard from './screens/Dashboard';
import Emergency from './screens/Emergency/Emergency';
import Guide from './screens/Guide/Guide';
import Home from './screens/Home';
import Prepare from './screens/Prepare/Prepare';
import AccountCreation from './screens/Profile/AccountCreation';
import Login from './screens/Profile/Login';
import Profile from './screens/Profile/Profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Icons from MaterialCommunityIcons
const TAB_ICONS = {
  Dashboard: {
    outline: 'home-outline',
    filled: 'home'
  },
  Prepare: {
    outline: 'clipboard-list-outline',
    filled: 'clipboard-list'
  },
  Emergency: {
    outline: 'alert-circle-outline', 
    filled: 'alert-circle'
  },
  Guide: {
    outline: 'message-question-outline',
    filled: 'message-question'
  },
  Profile: {
    outline: 'account-outline',
    filled: 'account'
  }
};

// Navbar Tabs Navigator (Main App after login)
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard" // Dashboard is default tab inside the app
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color }) => { 
          const iconSet = TAB_ICONS[route.name];
          const iconName = focused ? iconSet.filled : iconSet.outline;
          
          return (
            <MaterialCommunityIcons 
              name={iconName} 
              color={color} 
              size={28}
            />
          );
        },
        tabBarActiveTintColor: '#519872', 
        tabBarInactiveTintColor: '#3B5249', 
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 80,
          paddingBottom: 20,
          paddingTop: 12,
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Prepare" component={Prepare} />
      <Tab.Screen name="Emergency" component={Emergency} />
      <Tab.Screen name="Guide" component={Guide} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home" 
        screenOptions={{ headerShown: false }}
      >
        {/* Landing/Welcome Page */}
        <Stack.Screen name="Home" component={Home} />
        
        {/* Auth Flow */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="AccountCreation" component={AccountCreation} />
        
        {/* Main App (after login) */}
        <Stack.Screen name="MainApp" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
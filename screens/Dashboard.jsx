
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { globalStyles } from '../css';
import { getData } from '../storage/storageUtils';


export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getData('username').then((val) => {
      if (isMounted && val) setUsername(val);
    });
    // Check if this is the first visit
    AsyncStorage.getItem('dashboardVisited').then((visited) => {
      if (isMounted && !visited) {
        setFirstVisit(true);
        AsyncStorage.setItem('dashboardVisited', 'true');
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={globalStyles.heading}>
        {firstVisit && username
          ? `Welcome to Aftershock, ${username}!`
          : username
            ? `Welcome back, ${username}!`
            : 'Welcome back!'}
      </Text>

      <Text>Your Progress</Text>
      <Text>What's Next</Text>
      <Button title="During/After the Quake" />
    </View>
  );
}

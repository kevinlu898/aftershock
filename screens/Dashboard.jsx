

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../css';
import { getData } from '../storage/storageUtils';


export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [firstVisit, setFirstVisit] = useState(false);
  const navigation = useNavigation();

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
    <View style={globalStyles.container}>
    <ScrollView>  
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={globalStyles.heading}>
          {firstVisit && username
            ? `Welcome to Aftershock, ${username}!`
            : username
              ? `Welcome back, ${username}!`
              : 'Welcome back!'}
        </Text>
        <Text style={globalStyles.subheading}>
          Preparedness: 70% Your on your way!
        </Text>

        {/* 2x2 grid of large white containers */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 32 }}>
          {[ 
            {
              title: 'Continue Preparing',
              text: 'Keep working on your earthquake plan.',
              button: 'Continue',
              onPress: () => navigation.navigate('Prepare'),
            },
            {
              title: 'Review Plan',
              text: 'Check your current preparedness steps.',
              button: 'Review Now',
              onPress: () => navigation.navigate('Profile'),
            },
            {
              title: 'Offline Access',
              text: 'Access resources without internet.',
              button: 'Open Center',
              onPress: () => navigation.navigate('Emergency'), // Assuming Disaster Management Center is Emergency page
            },
            {
              title: 'Ask AI',
              text: 'Get instant help and advice.',
              button: 'Ask AI',
              onPress: () => navigation.navigate('Guide'),
            },
          ].map((item, idx) => (
            <View
              key={item.title}
              style={{
                width: '45%',
                height: 170,
                backgroundColor: '#fff',
                margin: '2.5%',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 22, color: '#34252F', fontWeight: 'bold', marginBottom: 8 }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 15, color: '#3B5249', textAlign: 'center', marginBottom: 12 }}>
                {item.text}
              </Text>
              <View style={{ width: '80%' }}>
                <TouchableOpacity onPress={item.onPress} style={{ backgroundColor: '#519872', borderRadius: 8 }}>
                  <Text style={{ color: '#fff', textAlign: 'center', paddingVertical: 10, fontSize: 16 }}>
                    {item.button}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <Text style={globalStyles.subheading}>
          Your Feed:
        </Text>
        <Text style={globalStyles.text}>
          - Recent Activity{"\n"}
          - Motivaiton{"\n"}
          - Local Risk{"\n"}
          - Earthquake News{"\n"}
        </Text>
      </View>
      </ScrollView>
    </View> 
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import Dashboard from '../screen/Dashboard';
import Profile from '../screen/Profile';
import Classes from '../screen/Classes';
import Settings from '../screen/Settings';
import EditProfile from '../screen/EditProfie';
import Students from '../screen/Students';
import StudentProfile from '../screen/StudentProfile';
import Plan from '../screen/Plans';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'none',
        headerShown: false,
      }}
      // dynamic initial route
      initialRouteName={user?.is_expired ? 'Plan' : 'Dashboard'}
    >
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Classes" component={Classes} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Students" component={Students} />
      <Stack.Screen name="StudentProfile" component={StudentProfile} />
      <Stack.Screen name="Plan" component={Plan} />
    </Stack.Navigator>
  );
};

export default StackNavigator;

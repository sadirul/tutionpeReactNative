// MainNavigator.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import Login from '../screen/Login';
import ForgotPassword from '../screen/ForgotPassword';
import StackNavigator from './StackNavigator';
import Signup from '../screen/Signup';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'none', // Match StackNavigator animation style
    }}
    initialRouteName="Login"
  >
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Signup" component={Signup} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <StackNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default MainNavigator;
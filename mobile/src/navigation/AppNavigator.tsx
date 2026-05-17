import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import StudentTabNavigator from './StudentTabNavigator';
import { COLORS } from '../constants/colors';

export default function AppNavigator() {
  const auth = useContext(AuthContext);

  if (auth?.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.ustpBlue} />
      </View>
    );
  }

  return auth?.user ? <StudentTabNavigator /> : <LoginScreen />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }
});
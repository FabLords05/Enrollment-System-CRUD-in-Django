import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosSetup';
import { COLORS } from '../constants/colors';

export default function LoginScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('token/', { email, password });
      console.log('API Response:', response.data);

      const decoded = jwtDecode<any>(response.data.access);
      console.log('Successfully Decoded:', decoded);

      const userRole = decoded?.role?.toUpperCase();
      if (userRole !== 'STUDENT') {
        Alert.alert(
          'Access Denied',
          'This mobile application is strictly for student use. Please use the web portal for administrative access.'
        );
        return;
      }

      await auth.login(response.data.access, response.data.refresh, {
        email: decoded.email,
        role: 'STUDENT',
      });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Login failed unexpectedly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.ustpDarkBlue }]}>
      <View style={styles.card}>
        <Text style={styles.title}>EduTrack Mobile</Text>
        <Text style={styles.subtitle}>University Student System</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput style={styles.input} placeholder="Gmail Address" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9CA3AF" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.btn} onPress={handleSignIn} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Connecting...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', padding: 24, borderRadius: 16 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.ustpDarkBlue, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },
  error: { color: COLORS.red, textAlign: 'center', marginBottom: 12, fontWeight: '600', fontSize: 13 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12, color: COLORS.textMain },
  btn: { backgroundColor: COLORS.ustpBlue, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});
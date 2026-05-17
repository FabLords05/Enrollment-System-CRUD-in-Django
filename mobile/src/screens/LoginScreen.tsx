import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosSetup';
import { COLORS } from '../constants/colors';

export default function LoginScreen() {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('token/', { email, password });
      await auth?.login(res.data.access, res.data.refresh, { email, role: 'STUDENT' });
    } catch (err) {
      setError('Invalid academic account verification credentials.');
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
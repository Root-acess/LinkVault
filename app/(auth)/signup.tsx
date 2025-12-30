import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
 

  const handleSignUp = () => {
    if (password !== rePassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Sign up attempt with:', { username, password });
    
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Signup
          </ThemedText>
         
        </View>

        
        <View style={styles.formSection}>

          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
              Email
            </ThemedText>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder="Enter Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>
        
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
              Username
            </ThemedText>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder="Enter Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

          
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
              Password
            </ThemedText>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
              Confirm Password
            </ThemedText>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder="Enter password again"
                placeholderTextColor="#999"
                value={rePassword}
                onChangeText={setRePassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <ThemedText type="defaultSemiBold" style={styles.signUpButtonText}>
              Signup
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.push('/(auth)/signin')}
          >
            
            <ThemedText type="link" style={styles.loginText}>
              Login
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
     marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  cardSection: {
    marginTop: 10,
  },
  cardInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
  },
  cvvRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvvInput: {
    flex: 1,
    marginRight: 10,
  },
  picestText: {
    fontSize: 12,
    color: '#666',
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#666',
    lineHeight: 18,
  },
});
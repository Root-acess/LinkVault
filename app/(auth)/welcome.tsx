import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';

const screenWidth = Dimensions.get("window").width;


export default function WelcomePage() {
  const router = useRouter();
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome, LinkVault
          </ThemedText>
          <ThemedText type="default" style={styles.description}>
            Turn your phone into your PC companion.
          </ThemedText>
          
         
          <View style={styles.imgSection}>
            <Image 
              source={require('@/assets/images/LinkVault-removebg-preview.png')} 
              style={styles.lapImage}
              resizeMode="contain"
            />
            <ThemedText type="subtitle" style={styles.keepReadyText}>
              Your laptop, now mobile!
            </ThemedText>
          </View>
        </View>

        
        {/* Login Button */}
        <View style={styles.buttonContainer}>
          <ThemedText 
            type="link" 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/signin')}
          >
            Login
          </ThemedText>
           <ThemedText 
            type="link" 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/signup')}
          >
            Signup
          </ThemedText>
        </View>

        
        
          
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent:'center'
   },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  topSection: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    marginBottom: 25,
  },
  imgSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  lapImage: {
    width: 290,
    height: 200,
    marginBottom: 15,
    marginTop: 15,
  },
  keepReadyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  buttonContainer: {
    alignItems: 'center',
    marginTop:50,
    
  },
  loginButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4f6f9ff',
    paddingVertical: 12,
    paddingHorizontal: screenWidth * 0.3,
    backgroundColor: '#087af4ff',
    borderRadius: 20,
     marginBottom: 20,
  },
  
  
});
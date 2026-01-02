import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <LinearGradient colors={["#b76df2", "#3a1c71"]} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>
          {isLogin ? "Login" : "Sign Up"}
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
        />

        {!isLogin && (
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            style={styles.input}
          />
        )}

        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.mainButtonText}>
            {isLogin ? "Login" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 25,
  },
  heading: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 15,
  },
  mainButton: {
    backgroundColor: "#9b5cff",
    padding: 15,
    borderRadius: 30,
    marginTop: 10,
  },
  mainButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  switchText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 15,
  },
});

import React from "react";
import { StyleSheet, TextInput } from "react-native";

interface Props {
  placeholder: string;
  secureTextEntry?: boolean;
}

export default function Input({ placeholder, secureTextEntry }: Props) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      secureTextEntry={secureTextEntry}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    marginVertical: 8,
  },
});

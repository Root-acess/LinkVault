import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

export function CommandBar({
  value,
  onChange,
  onSend,
  onMic,
  listening,
}: any) {
  return (
    <View style={{ flexDirection: 'row', padding: 12 }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Ask something..."
        style={{ flex: 1 }}
      />

      <TouchableOpacity onPress={onMic}>
        <Ionicons
          name={listening ? 'mic' : 'mic-outline'}
          size={22}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onSend}>
        <Ionicons name="send" size={22} />
      </TouchableOpacity>
    </View>
  );
}

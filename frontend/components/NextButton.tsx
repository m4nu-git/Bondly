import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/constants/Colors';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export default function NextButton({ onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name="chevron-forward" size={26} color={disabled ? C.disabledIcon : '#fff'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    bottom: 48,
    right: 25,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  btnDisabled: {
    backgroundColor: C.disabled,
  },
});

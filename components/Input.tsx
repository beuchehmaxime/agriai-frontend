import { TextInput, View, Text } from 'react-native';
import clsx from 'clsx';

interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    label?: string;
    keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    className?: string;
}

export default function Input({ value, onChangeText, placeholder, label, keyboardType, secureTextEntry, autoCapitalize, autoCorrect, className }: InputProps) {
    return (
        <View className={clsx("mb-4", className)}>
            {label && <Text className="text-gray-600 mb-2 font-medium">{label}</Text>}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-800 focus:border-primary focus:border-2"
                placeholderTextColor="#9CA3AF"
            />
        </View>
    );
}

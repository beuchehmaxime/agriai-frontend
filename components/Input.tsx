import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react-native';

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
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View className={clsx("mb-4", className)}>
            {label && <Text className="text-gray-600 mb-2 font-medium">{label}</Text>}
            <View className="relative justify-center">
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    className={clsx(
                        "bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-800 focus:border-primary focus:border-2",
                        secureTextEntry && "pr-12"
                    )}
                    placeholderTextColor="#00000066"
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-4"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {isPasswordVisible ? (
                            <EyeOff color="#9CA3AF" size={24} />
                        ) : (
                            <Eye color="#9CA3AF" size={24} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

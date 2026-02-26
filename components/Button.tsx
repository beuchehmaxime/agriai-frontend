import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

import { clsx } from 'clsx'; // Make sure to install clsx: npm install clsx

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'yellow';
    loading?: boolean;
    className?: string;
    disabled?: boolean;
}

export default function Button({ onPress, title, variant = 'primary', loading, className, disabled }: ButtonProps) {
    const baseStyles = `${loading && 'bg-gray-500'} py-4 px-6 rounded-xl flex-row justify-center items-center shadow-sm active:opacity-80`;
    const variants = {
        primary: "bg-primary",
        secondary: "bg-secondary",
        yellow: "bg-yellow-400",
        outline: "border-2 border-primary bg-transparent",
    };
    const textVariants = {
        primary: "text-white font-bold text-lg",
        secondary: "text-white font-bold text-lg",
        yellow: "text-white font-bold text-lg",
        outline: "text-primary font-bold text-lg",
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading || disabled}
            className={clsx(baseStyles, variants[variant], className, (loading || disabled) && 'opacity-50')}
        >
            {loading ? (
                title === "Diagnose" ? (
                    <>
                        <Text className={textVariants[variant]}>Diagnosing</Text>
                        <ActivityIndicator color={variant === 'outline' ? '#4ADE80' : 'white'} />
                    </>
                ) : (
                    <ActivityIndicator color={variant === 'outline' ? '#4ADE80' : 'white'} />
                )
            ) : (
                <Text className={textVariants[variant]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

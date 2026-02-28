import { useState } from 'react';
import { View, Text, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Camera, ChevronLeft, Image as ImageIcon, X } from 'lucide-react-native';
import { saveDiagnosisLocal } from '../../services/database';

import { useNetwork } from '../../context/NetworkContext';
import { useUserStore } from '../../store/userStore';
import { usePredictDiagnosis } from '../../hooks/useDiagnosis';
import FullScreenLoader from '../../components/FullScreenLoader';

// ...
export default function DiagnoseScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [crop, setCrop] = useState<string>('Maize'); // Default or dropdown
    const [symptoms, setSymptoms] = useState('');
    const router = useRouter();
    const { isConnected } = useNetwork();
    const { token } = useUserStore();

    // ...
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted) {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } else {
            Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        }
    };

    const diagnosisMutation = usePredictDiagnosis();
    const handleSubmit = () => {
        if (!image) {
            Alert.alert('Image Required', 'Please provide an image of the crop.');
            return;
        }
        diagnosisMutation.mutate(
            { image, crop, symptoms },
            {
                onSuccess: () => {
                    // Reset UI State after successful transition 
                    setImage(null);
                    setCrop('Maize');
                    setSymptoms('');
                }
            }
        );
    };

    return (
        <ScrollView className="flex-1 bg-white p-4 pt-16">
            <Text className="text-lg font-bold text-gray-800 text-center mb-4 uppercase tracking-widest">New Diagnosis</Text>

            {/* Image Picker */}
            <View className="mb-6">
                {image ? (
                    <View className="relative">
                        <Image source={{ uri: image }} className="w-full h-64 rounded-xl" />
                        <TouchableOpacity
                            onPress={() => setImage(null)}
                            className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                        >
                            <X color="white" size={20} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex-row justify-between gap-2 space-x-4">
                        <TouchableOpacity onPress={takePhoto} className="flex-1 bg-gray-100 h-40 rounded-xl items-center justify-center border-2 border-dashed border-gray-300">
                            <Camera color="#4B5563" size={32} />
                            <Text className="text-gray-500 mt-2 font-medium">Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage} className="flex-1 bg-gray-100 h-40 rounded-xl items-center justify-center border-2 border-dashed border-gray-300">
                            <ImageIcon color="#4B5563" size={32} />
                            <Text className="text-gray-500 mt-2 font-medium">Gallery</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Form */}
            <View className="mb-6">
                <Text className="text-gray-600 mb-2 font-medium">Select Crop</Text>
                <View className="flex-row space-x-2 gap-2 mb-4">
                    {['Maize', 'Tomato', 'Cassava'].map((c) => (
                        <TouchableOpacity
                            key={c}
                            onPress={() => setCrop(c)}
                            className={`px-4 py-2 rounded-full border ${crop === c ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                        >
                            <Text className={crop === c ? 'text-white font-bold' : 'text-gray-600'}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Input
                    label="Symptoms (Optional)"
                    placeholder="e.g. Yellow leaves, holes..."
                    value={symptoms}
                    onChangeText={setSymptoms}
                />
            </View>

            <Button
                title="Diagnose"
                onPress={handleSubmit}
                loading={diagnosisMutation.isPending}
                disabled={diagnosisMutation.isPending}
            />
            <View className="h-20" />
            <FullScreenLoader visible={diagnosisMutation.isPending} message="Analyzing image..." />
        </ScrollView>
    );
}

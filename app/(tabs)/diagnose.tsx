import { useState } from 'react';
import { View, Text, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Camera, ChevronLeft, Image as ImageIcon, X } from 'lucide-react-native';
import api, { DiagnosisService, getErrorMessage } from '../../services/api';
import { saveDiagnosisLocal } from '../../services/database';
import { useMutation } from '@tanstack/react-query';

import { useNetwork } from '../../context/NetworkContext';
import { useUserStore } from '../../store/userStore';

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

    const diagnosisMutation = useMutation({
        mutationFn: async (data: any) => {
            // Check connectivity and authentication
            if (isConnected && token) {
                try {
                    console.log('Online Mode & Logged In: Sending image to API...');

                    const formData = new FormData();

                    // Handle image for multipart/form-data
                    const uri = data.image;
                    const fileName = uri.split('/').pop() || 'photo.jpg';
                    const match = /\.(\w+)$/.exec(fileName);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;

                    formData.append('image', {
                        uri,
                        name: fileName,
                        type,
                    } as any);
                    formData.append('cropType', data.crop);
                    if (data.symptoms) formData.append('symptoms', data.symptoms);
                    if (data.location) formData.append('location', data.location);

                    const response = await DiagnosisService.predict(formData);
                    // Add imageUri to the response so it can be used in result screen
                    return {
                        ...response.data,
                        diagnosis: {
                            ...response.data.diagnosis,
                            imageUri: data.image
                        }
                    };
                } catch (e) {
                    console.error('Online API failed:', e);
                    throw e;
                }
            } else {
                console.log('Offline/Guest Mode: Using local model logic');

                // Return dummy data (Offline Model Simulation)
                await new Promise(resolve => setTimeout(resolve, 2000));
                return {
                    diagnosis: {
                        id: Math.random().toString(),
                        cropType: data.crop,
                        disease: 'Fall Armyworm (Offline Prediction)',
                        confidence: 0.89,
                        advice: 'Fall Armyworm creates ragged holes in leaves.\n\nTreatment:\n1. Apply neem oil solution.\n2. Use pheromone traps.\n3. Manual removal for small plots.\n\nPrevention:\n- Early planting.\n- Intercropping with legumes.',
                        imageUri: data.image
                    }
                };
            }
        },
        onSuccess: async (data) => {
            // data is { diagnosis: ... }
            if (data && data.diagnosis) {
                await saveDiagnosisLocal(data.diagnosis);

                router.push({
                    pathname: '/diagnosis/result',
                    params: {
                        result: JSON.stringify(data.diagnosis)
                    }
                });
                setImage(null);
                setCrop('Maize');
                setSymptoms('');
            }
        },
        onError: (error) => {
            const errorMessage = getErrorMessage(error);
            Alert.alert('Error', errorMessage);
            console.error(error);
        }
    });

    const handleSubmit = () => {
        if (!image) {
            Alert.alert('Image Required', 'Please provide an image of the crop.');
            return;
        }
        diagnosisMutation.mutate({ image, crop, symptoms });
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
            />
            <View className="h-20" />
        </ScrollView>
    );
}

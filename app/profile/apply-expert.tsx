import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload, FileText } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useUserStore } from '../../store/userStore';
import { apiClient as api } from '../../services/apiClient';

export default function ApplyExpertScreen() {
    const router = useRouter();
    const { token } = useUserStore();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        experience: '',
        qualifications: '',
        certificateType: '',
        obtainedYear: '',
        institution: '',
    });
    const [certificate, setCertificate] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                if (file.size && file.size > 2 * 1024 * 1024) {
                    Alert.alert('File too large', 'Please upload a PDF smaller than 2MB.');
                    return;
                }
                setCertificate(file);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const submitApplication = async () => {
        if (!form.experience || !form.qualifications || !form.certificateType || !form.obtainedYear || !form.institution || !certificate) {
            Alert.alert('Error', 'All fields and certificate PDF are required.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('experience', form.experience);
            formData.append('qualifications', form.qualifications);
            formData.append('certificateType', form.certificateType);
            formData.append('obtainedYear', form.obtainedYear);
            formData.append('institution', form.institution);

            formData.append('certificate', {
                uri: certificate.uri,
                name: certificate.name,
                type: certificate.mimeType || 'application/pdf',
            } as any);

            const response = await api.post('/expert-application', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                Alert.alert('Success', 'Your application has been submitted successfully.');
                router.back();
            }
        } catch (error: any) {
            console.error('Submit error:', error.response?.data || error.message);
            const msg = error.response?.data?.error || 'Failed to submit application. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ArrowLeft color="#1F2937" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 ml-4">Apply to be an Expert</Text>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-gray-500 leading-6">
                        Join our platform as an agronomist to consult with farmers. Please provide your qualifications below.
                    </Text>
                </View>

                <View className="mb-4">
                    <View className="mb-2">
                        <Text className="text-gray-700 font-semibold">Years of Experience</Text>
                    </View>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
                        placeholder="e.g., 5 years"
                        value={form.experience}
                        onChangeText={(t) => setForm({ ...form, experience: t })}
                    />
                </View>

                <View className="mb-4">
                    <View className="mb-2">
                        <Text className="text-gray-700 font-semibold">Qualifications</Text>
                    </View>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 h-24"
                        placeholder="Describe your degrees and expertise"
                        multiline
                        textAlignVertical="top"
                        value={form.qualifications}
                        onChangeText={(t) => setForm({ ...form, qualifications: t })}
                    />
                </View>

                <View className="mb-4">
                    <View className="mb-2">
                        <Text className="text-gray-700 font-semibold">Certificate Type</Text>
                    </View>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
                        placeholder="e.g., BSc. Agriculture, Certified Agronomist"
                        value={form.certificateType}
                        onChangeText={(t) => setForm({ ...form, certificateType: t })}
                    />
                </View>

                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <View className="mb-2">
                            <Text className="text-gray-700 font-semibold">Institution</Text>
                        </View>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
                            placeholder="University name"
                            value={form.institution}
                            onChangeText={(t) => setForm({ ...form, institution: t })}
                        />
                    </View>
                    <View className="flex-1">
                        <View className="mb-2">
                            <Text className="text-gray-700 font-semibold">Year Obtained</Text>
                        </View>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
                            placeholder="YYYY"
                            keyboardType="numeric"
                            value={form.obtainedYear}
                            onChangeText={(t) => setForm({ ...form, obtainedYear: t })}
                        />
                    </View>
                </View>

                <View className="mb-8">
                    <View className="mb-2">
                        <Text className="text-gray-700 font-semibold">Certificate Upload (PDF, Max 2MB)</Text>
                    </View>
                    <TouchableOpacity
                        onPress={pickDocument}
                        className="bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl p-6 items-center flex-row justify-center gap-4"
                    >
                        {certificate ? (
                            <>
                                <FileText color="#4ADE80" size={32} />
                                <View className="flex-1">
                                    <Text className="font-semibold text-gray-800" numberOfLines={1}>{certificate.name}</Text>
                                    <View className="mt-1">
                                        <Text className="text-gray-500 text-xs">
                                            {certificate.size ? (certificate.size / 1024 / 1024).toFixed(2) : 0} MB
                                        </Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <Upload color="#4ADE80" size={32} />
                                <Text className="font-semibold text-primary">Tap to select PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={submitApplication}
                    disabled={loading}
                    className={`bg-primary w-full py-4 rounded-2xl shadow-lg shadow-green-200 mb-12 flex-row justify-center items-center`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">Submit Application</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

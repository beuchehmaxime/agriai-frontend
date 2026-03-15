import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { socketService } from '../../services/socket';
import { MessageService } from '../../services/messageService';

export default function ChatScreen() {
    const { id, name } = useLocalSearchParams();
    const router = useRouter();
    const { userId: currentUserId } = useUserStore();
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchMessages();

        const socket = socketService.getSocket();

        const handleNewMessage = (msg: any) => {
            if (msg.consultationId === id) {
                setMessages(prev => {
                    // Prevent duplicates
                    if (prev.some(m => m.id === msg.id)) return prev;
                    const newMessages = [msg, ...prev];
                    return newMessages.sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                });
                // Mark message as read since user is on screen
                if (msg.senderId !== currentUserId) {
                    socketService.markAsRead(id as string);
                }
            }
        };

        const handleMessageSent = (msg: any) => {
            if (msg.consultationId === id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    const newMessages = [msg, ...prev];
                    return newMessages.sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                });
            }
        };

        const handleMessagesRead = (data: any) => {
            if (data.consultationId === id) {
                setMessages(prev => prev.map(m => (!m.isRead && m.senderId === currentUserId) ? { ...m, isRead: true, readAt: data.readAt } : m));
            }
        };

        if (socket) {
            socket.on('receive_message', handleNewMessage);
            socket.on('message_sent', handleMessageSent);
            socket.on('messages_read', handleMessagesRead);
        }

        return () => {
            if (socket) {
                socket.off('receive_message', handleNewMessage);
                socket.off('message_sent', handleMessageSent);
                socket.off('messages_read', handleMessagesRead);
            }
        };
    }, [id]);

    const fetchMessages = async () => {
        try {
            const res = await MessageService.getMessages(id as string);
            if (res?.success && Array.isArray(res.data)) {
                // Ensure messages are strictly sorted from newest to oldest for the inverted list
                const sortedMessages = [...res.data].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setMessages(sortedMessages);
            }
            socketService.markAsRead(id as string);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!text.trim()) return;

        socketService.sendMessage(id as string, text.trim());
        setText('');
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
        });

        if (!result.canceled && result.assets.length > 0) {
            const asset = result.assets[0];
            if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
                alert('Image is too large. Max size is 5MB.');
                return;
            }

            setUploadingImage(true);
            try {
                const res = await MessageService.sendMessageImage(id as string, asset.uri);
                if (res?.success) {
                    setMessages(prev => {
                        const newMessages = [res.data, ...prev];
                        return newMessages.sort((a, b) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        );
                    });
                }
            } catch (err) {
                console.error('Failed to send image', err);
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === currentUserId;
        return (
            <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <View className={`p-1 px-3 rounded-2xl flex-col ${isMe ? 'bg-primary rounded-br-none' : 'bg-white border border-gray-100 rounded-bl-none'}`}>
                    {item.text ? (
                        <Text className={`${isMe ? 'text-white' : 'text-gray-800'}`}>{item.text}</Text>
                    ) : null}
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} className="w-48 h-48 rounded-lg mt-2 mb-1" resizeMode="cover" />
                    ) : null}
                    <Text className={`text-[10px] self-end mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft color="#1F2937" size={24} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-xl font-bold text-gray-900">{name ? (name as string) : 'Chat'}</Text>
                    </View>
                </View>


                <View className="flex-1">
                    {loading ? (
                        <ActivityIndicator color="#4ADE80" className="mt-10" />
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item, index) => item.id || index.toString()}
                            contentContainerStyle={{ padding: 16 }}
                            inverted
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View className="mb-0 items-center">
                                    <Text className="text-center text-lg text-gray-500">No messages yet. Say hi!</Text>
                                </View>
                            }
                        />
                    )}
                </View>

                {uploadingImage && (
                    <View className="h-6 justify-center items-center">
                        <Text className="text-xs text-gray-400">Uploading image...</Text>
                    </View>
                )}
                <View className="p-4 bg-white border-t border-gray-100 flex-row items-center">
                    <TouchableOpacity onPress={pickImage} className="p-2 mr-2 bg-gray-100 rounded-full" disabled={uploadingImage}>
                        <ImageIcon color="#4B5563" size={24} />
                    </TouchableOpacity>
                    <TextInput
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-800"
                        placeholder="Type a message..."
                        placeholderTextColor="#00000066"
                        value={text}
                        onChangeText={setText}
                        onSubmitEditing={() => sendMessage()}
                        editable={!uploadingImage}
                    />
                    <TouchableOpacity
                        onPress={() => sendMessage()}
                        className={`p-3 ml-2 rounded-full ${text.trim() && !uploadingImage ? 'bg-primary' : 'bg-gray-200'}`}
                        disabled={!text.trim() || uploadingImage}
                    >
                        <Send color={text.trim() && !uploadingImage ? "white" : "#9CA3AF"} size={20} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

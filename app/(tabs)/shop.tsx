import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ShoppingCart, Plus, Minus, Inbox, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCategories, useProducts } from '../../hooks/useShop';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../utils/currency';

export default function ShopScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const { data: categories, isLoading: isCategoriesLoading } = useCategories();
    const { data: products, isLoading: isProductsLoading } = useProducts({
        search: searchQuery.length > 2 ? searchQuery : undefined,
        categoryId: selectedCategory || undefined
    });

    const cartItemsCount = useCartStore((state) => state.getTotalItems());
    const addItem = useCartStore((state) => state.addItem);
    const cartItems = useCartStore((state) => state.items);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4 bg-white shadow-sm z-10">
                <Text className="text-2xl font-black text-gray-900">AgriShop</Text>
                <TouchableOpacity
                    onPress={() => router.push('/shop/cart')}
                    className="p-2 bg-white rounded-full shadow-sm relative"
                >
                    <ShoppingBag color="#374151" size={24} />
                    {cartItemsCount > 0 && (
                        <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center border-2 border-white z-10">
                            <Text className="text-white text-[10px] font-bold">{cartItemsCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                stickyHeaderIndices={[0]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Search Bar section */}
                <View className="bg-white px-6 py-4 shadow-sm z-10 pb-2">
                    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
                        <Search color="#9CA3AF" size={20} />
                        <TextInput
                            placeholder="Search fertilizers, seeds, pesticides..."
                            className="flex-1 ml-3 py-1 text-base font-medium text-gray-800"
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Categories Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mt-3 pb-2"
                    >
                        <TouchableOpacity
                            onPress={() => setSelectedCategory('')}
                            className={`px-6 py-2 rounded-full mr-3 border ${selectedCategory === '' ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-bold ${selectedCategory === '' ? 'text-white' : 'text-gray-600'}`}>All</Text>
                        </TouchableOpacity>

                        {isCategoriesLoading ? (
                            <ActivityIndicator color="#4ADE80" className="ml-4" />
                        ) : (
                            categories?.map((cat: any) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1 flex items-center justify-center rounded-full mr-3 border ${selectedCategory === cat.id ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`font-bold text-xs ${selectedCategory === cat.id ? 'text-white' : 'text-gray-600'}`}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* Products Grid */}
                <View className="px-6 py-6 flex-row flex-wrap justify-between">
                    {isProductsLoading ? (
                        <View className="w-full py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#4ADE80" />
                            <Text className="text-gray-500 mt-4 font-medium">Loading products...</Text>
                        </View>
                    ) : products?.length === 0 ? (
                        <View className="w-full py-20 items-center justify-center">
                            <View className="bg-gray-100 p-6 rounded-full mb-4">
                                <Inbox color="#9CA3AF" size={48} />
                            </View>
                            <Text className="text-xl font-bold text-gray-800 mb-2">No products found</Text>
                            <Text className="text-gray-500 text-center">We couldn't find any products matching your current search or category.</Text>
                        </View>
                    ) : (
                        products?.map((product: any) => {
                            const cartItem = cartItems.find(i => i.product.id === product.id);
                            const currentQty = cartItem?.quantity || 0;
                            const isMaxReached = currentQty >= (product.stockQuantity ?? 99);

                            return (
                                <View key={product.id} className="w-[48%] bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-4 flex">
                                    <View className="w-full aspect-square bg-gray-50 rounded-2xl mb-3 overflow-hidden">
                                        {product.imageUrl ? (
                                            <Image source={{ uri: product.imageUrl }} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <View className="w-full h-full items-center justify-center">
                                                <ShoppingCart color="#CBD5E1" size={32} />
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-1 justify-between">
                                        <View>
                                            <Text className="text-xs font-bold text-gray-500 capitalize tracking-wider mb-1" numberOfLines={1}>
                                                {product.category?.name || 'Item'}
                                            </Text>
                                            <Text className="text-md font-bold uppercase text-gray-900 mb-1 leading-tight" numberOfLines={2}>
                                                {product.name}
                                            </Text>
                                        </View>

                                        <View className="flex-row items-end justify-between mt-1">
                                            <Text className="text-lg font-black text-gray-900">{formatCurrency(product.price)}</Text>

                                            <TouchableOpacity
                                                onPress={() => addItem(product)}
                                                disabled={isMaxReached}
                                                className={`${isMaxReached ? 'bg-gray-200' : 'bg-primary shadow-green-200 shadow-sm'} w-8 h-8 rounded-full items-center justify-center`}
                                            >
                                                <Plus color={isMaxReached ? '#9CA3AF' : 'white'} size={16} strokeWidth={3} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    )}
                </View>
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}

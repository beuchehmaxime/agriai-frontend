import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Network from 'expo-network';

interface NetworkContextType {
    isConnected: boolean;
    isInternetReachable: boolean;
    checkConnection: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    isInternetReachable: true,
    checkConnection: async () => { },
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(true);
    const [isInternetReachable, setIsInternetReachable] = useState(true);

    const checkConnection = async () => {
        try {
            const status = await Network.getNetworkStateAsync();
            setIsConnected(!!status.isConnected);
            setIsInternetReachable(!!status.isInternetReachable);
        } catch (error) {
            console.error('Failed to check network status:', error);
            // Default to offline in case of error to be safe, or maintain last state
            setIsConnected(false);
            setIsInternetReachable(false);
        }
    };

    useEffect(() => {
        checkConnection();
        // Poll every 10 seconds or consider using NetInfo event listener if available/preferred
        // For expo-network, we often just check on mount or interactions, but a simple interval helps for now
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NetworkContext.Provider value={{ isConnected, isInternetReachable, checkConnection }}>
            {children}
        </NetworkContext.Provider>
    );
};

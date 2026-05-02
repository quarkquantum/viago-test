import { addEventListener } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type NetworkState = {
  isConnected: boolean | null;
  isOffline: boolean;
};

const NetworkContext = createContext<NetworkState>({
  isConnected: null,
  isOffline: false,
});

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = addEventListener((state) => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      onlineManager.setOnline(connected);
    });

    return unsubscribe;
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, isOffline: isConnected === false }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { config } from '@repo/design-system/mobile/theme/config';
import { Colors } from '@repo/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { PendingActionsBanner } from './components/pending-actions-banner';
import { AuthProvider } from './contexts/auth-context';
import { NetworkProvider, useNetwork } from './contexts/network-context';
import i18n from './i18n';
import { StorageKeys, storage } from './lib/storage';
import { useOfflineQueueReplay } from './lib/use-offline-queue-replay';
import { RootNavigator } from './navigation/root-navigator';

const queryClient = new QueryClient();

const NetworkAwareStatusBar = () => {
  const { isOffline } = useNetwork();
  return (
    <StatusBar
      backgroundColor={isOffline ? Colors.DESTRUCTIVE : Colors.BACKGROUND}
      barStyle={isOffline ? 'light-content' : 'dark-content'}
    />
  );
};

const OfflineQueueManager = () => {
  useOfflineQueueReplay();
  return null;
};

function App() {
  useEffect(() => {
    const language = storage.getString(StorageKeys.LANGUAGE);
    i18n.changeLanguage(language);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NetworkProvider>
        <PaperProvider theme={config}>
          <BottomSheetModalProvider>
            <SafeAreaProvider>
              <I18nextProvider i18n={i18n}>
                <QueryClientProvider client={queryClient}>
                  <OfflineQueueManager />
                  <NetworkAwareStatusBar />
                  <PendingActionsBanner />
                  <AuthProvider>
                    <RootNavigator />
                    <Toaster swipeToDismissDirection="up" />
                  </AuthProvider>
                </QueryClientProvider>
              </I18nextProvider>
            </SafeAreaProvider>
          </BottomSheetModalProvider>
        </PaperProvider>
      </NetworkProvider>
    </GestureHandlerRootView>
  );
}

export default App;

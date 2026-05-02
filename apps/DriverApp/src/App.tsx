import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { config } from '@repo/design-system/mobile/theme/config';
import { Colors } from '@repo/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { AuthProvider } from './contexts/auth-context';
import { NetworkProvider, useNetwork } from './contexts/network-context';
import i18n from './i18n';
import { storage, StorageKeys } from './lib/storage';
import { useOfflineQueueReplay } from './lib/use-offline-queue-replay';
import { GlobalNotice } from './components/global-notice';
import { PendingActionsBanner } from './components/pending-actions-banner';
import { RootNavigator } from './navigation/RootNavigator';
import { initializeNotifications } from './utils/notifications';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 3_600_000,
      retry: 2,
    },
  },
});

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
    initializeNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <NetworkProvider>
        <AuthProvider>
          <PaperProvider theme={config}>
            <BottomSheetModalProvider>
              <SafeAreaProvider>
                <I18nextProvider i18n={i18n}>
                  <QueryClientProvider client={queryClient}>
                    <OfflineQueueManager />
                    <NetworkAwareStatusBar />
                    <GlobalNotice />
                    <PendingActionsBanner />
                    <RootNavigator />
                    <Toaster swipeToDismissDirection="up" />
                  </QueryClientProvider>
                </I18nextProvider>
              </SafeAreaProvider>
            </BottomSheetModalProvider>
          </PaperProvider>
        </AuthProvider>
      </NetworkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
});

export default App;

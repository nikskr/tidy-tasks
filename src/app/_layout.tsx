import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { migrate } from '@/db/migrations';
import { initMonitoring, reportError, wrapRoot } from '@/lib/monitoring';
import { usePalette } from '@/theme';

initMonitoring();

const DATABASE_NAME = 'tidytasks.db';

function RootLayout() {
  const c = usePalette();
  const scheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={migrate}
        onError={(error) => reportError(error, 'db.init')}
      >
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: c.background },
            headerTintColor: c.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: c.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Tidy Tasks', headerLargeTitle: true }} />
          <Stack.Screen name="about" options={{ title: 'About', presentation: 'modal' }} />
        </Stack>
      </SQLiteProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}

export default wrapRoot(RootLayout);

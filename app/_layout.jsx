// We still import this for its side-effects, but we won't rely on timing.
import '../firebaseConfig';

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from 'react';
import { View } from 'react-native';

// Import the auth object and the onAuthStateChanged listener
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function RootLayout() {
  // This state will track whether Firebase is ready.
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // onAuthStateChanged returns an "unsubscribe" function.
    // The very first time this listener runs, we know the auth service is initialized.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Firebase is ready. It doesn't matter if the user is logged in or not.
      setFirebaseReady(true);
      
      // We only need to run this once to confirm initialization, so we unsubscribe immediately.
      unsubscribe();
    });
  }, []); // The empty array ensures this effect runs only once on mount.

  // While firebaseReady is false, we render nothing (or a loading spinner).
  // This prevents any child screens (like Login.jsx) from rendering and causing the error.
  if (!firebaseReady) {
    return <View style={{ flex: 1, backgroundColor: '#0F2027' }} />; // Shows a blank screen matching your theme.
  }

  // Once Firebase is ready, we render the actual app layout.
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ headerShown: false }} />
        <Stack.Screen name="Home" options={{ headerShown: false }} />
        <Stack.Screen name="Attendance" options={{ headerShown: false }} />
        <Stack.Screen name="Leave" options={{ headerShown: false }} />
        <Stack.Screen name="RequestLeave" options={{ headerShown: false }} />
        <Stack.Screen name="ApprovedLeave" options={{ headerShown: false }} />
        <Stack.Screen name="RejectedLeave" options={{ headerShown: false }} />
        <Stack.Screen name="Payslip" options={{ headerShown: false }} />
        <Stack.Screen name="Profile" options={{ headerShown: false }} />
        
      </Stack>
    </SafeAreaProvider>
  );
}
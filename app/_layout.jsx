import { AuthProvider } from "@/utils/authContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import "../global.css";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen 
            name="(protected)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="login"
            options={{
              "headerShown": false,
              animation: "none",
            }}
          />
          <Stack.Screen 
            name="signup"
            options={{
              "headerShown": false,
            }}
          />
        </Stack>
      </AuthProvider>

      <Toast />
    </KeyboardProvider>
    
  );
}

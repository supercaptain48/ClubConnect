import { AuthProvider } from "@/utils/authContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import "../global.css";
import { MenuProvider } from "react-native-popup-menu";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <AuthProvider>
        <MenuProvider>
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
              }}
            />
            <Stack.Screen 
              name="signup"
              options={{
                "headerShown": false,
              }}
            />
            <Stack.Screen 
              name="forgotPassword"
              options={{
                title: "",
                headerShadowVisible: false,
              }}
            />
          </Stack>
        </MenuProvider>
      </AuthProvider>
      <Toast />
    </KeyboardProvider>
    
  );
}

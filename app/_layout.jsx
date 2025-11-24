import { AuthProvider } from "@/utils/authContext";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen 
          name="(protected)"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
        <Stack.Screen 
          name="login"
          options={{
            animation: "none",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}

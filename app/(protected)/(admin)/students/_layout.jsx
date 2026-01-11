import { Stack } from "expo-router";

export default function ClubsLayout() {
    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerTitleAlign: "center"
        }}>
            <Stack.Screen 
                name="index" 
                options={{
                    headerTitle: "Students",
                    headerStyle: { backgroundColor: "#ffffff" },
                    headerTitleAlign: "center",
                    headerTintColor: "#22c55e",
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 30,
                    },
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen name="[id]" options={{ title: "" }} />
        </Stack>
    )
}
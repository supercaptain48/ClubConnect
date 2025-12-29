import { Stack } from "expo-router";

export default function ClubsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
                name="index" 
                options={{
                    headerShown: true,
                    headerTitle: "Clubs",
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
            <Stack.Screen name="createClub" />
        </Stack>
    )
}
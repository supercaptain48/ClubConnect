import { Stack } from "expo-router";

export default function IDLayout() {
    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerTitleAlign: "center"
        }}>
            <Stack.Screen name="index" options={{ title: "" }} />
            <Stack.Screen name="members" options={{ title: "Members" }} />
            <Stack.Screen name="viewPastEvents" options={{ title: "Past Events" }} />
            <Stack.Screen name="viewEvent" options={{ title: "" }} />
        </Stack>
    )
}
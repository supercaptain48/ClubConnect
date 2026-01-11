import { Stack } from "expo-router";

export default function IDLayout() {
    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerTitleAlign: "center"
        }}>
            <Stack.Screen name="index" options={{ title: "" }} />
            <Stack.Screen 
                name="createEvent" 
                options={{
                    title: "Create Event",                    
                }} 
            />
            <Stack.Screen 
                name="createAnnouncement" 
                options={{
                    title: "Create Announcement",                    
                }} 
            />
            <Stack.Screen 
                name="members" 
                options={{
                    title: "Members",                    
                }} 
            />
        </Stack>
    )
}
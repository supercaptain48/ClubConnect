import { Stack } from "expo-router";

export default function HomeLayout() {
    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerTitleAlign: "center"
        }}>
            <Stack.Screen 
                name="index" 
                options={{ 
                    title: "ClubConnect",
                    tabBarActiveTintColor: "#22c55e", 
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
            <Stack.Screen 
                name="checkIn" 
                options={{
                    title: "",                    
                }} 
            />
            <Stack.Screen 
                name="viewEvent" 
                options={{
                    title: "",                    
                }} 
            />
        </Stack>
    )
}
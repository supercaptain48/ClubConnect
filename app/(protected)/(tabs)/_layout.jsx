import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: "Home", 
                    tabBarIcon: ({ color }) => <Ionicons size={22} name="home" color={color} />
                }} 
            />
            <Tabs.Screen 
                name="settings" 
                options={{ 
                    title: "Settings", 
                    tabBarIcon: ({ color }) => <Ionicons size={22} name="settings" color={color} />
                }} 
            />
        </Tabs>
    )
}
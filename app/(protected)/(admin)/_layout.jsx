import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminTabsLayout() {
    return (
        <Tabs screenOptions={{ 
            tabBarActiveTintColor: "#22c55e", 
            headerStyle: { backgroundColor: "#ffffff" },
            headerTitleAlign: "center",
            headerTintColor: "#22c55e",
            headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 30,
            },
            headerShadowVisible: false,
        }}>
            <Tabs.Screen 
                name="(home)" 
                options={{ 
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons size={22} name="home" color={color} />
                }} 
            />
            <Tabs.Screen 
                name="clubs" 
                options={{ 
                    title: "Clubs", 
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome size={22} name="group" color={color} />
                }} 
            />
            <Tabs.Screen 
                name="students" 
                options={{ 
                    title: "Students", 
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome5 size={22} name="user-graduate" color={color} />
                }} 
            />
            <Tabs.Screen 
                name="settings" 
                options={{ 
                    title: "Settings", 
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome5 size={22} name="cog" color={color} />
                }} 
            />
        </Tabs>
    )
}
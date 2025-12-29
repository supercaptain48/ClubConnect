import { FontAwesome, Ionicons } from "@expo/vector-icons";
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
                name="index" 
                options={{ 
                    title: "Home",
                    headerTitle: "ClubConnect",
                    headerShadowVisible: false,
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
        </Tabs>
    )
}
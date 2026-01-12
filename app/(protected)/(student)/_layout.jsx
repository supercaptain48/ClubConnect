import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ 
            headerStyle: { backgroundColor: "#ffffff" },
            headerTitleAlign: "center",
            headerTintColor: "#22c55e",
            headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 30,
            },
            headerShadowVisible: false,
            tabBarActiveTintColor: "#22c55e" 
        }}>
            <Tabs.Screen 
                name="(home)" 
                options={{ 
                    headerShown: false,
                    title: "Home",
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
                name="events" 
                options={{ 
                    title: "Events", 
                    tabBarIcon: ({ color }) => <Ionicons size={22} name="calendar" color={color} />
                }} 
            />
            <Tabs.Screen 
                name="profile" 
                options={{ 
                    title: "Profile", 
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome size={22} name="user-circle" color={color} />
                }} 
            />
        </Tabs>
    )
}
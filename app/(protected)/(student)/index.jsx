import { Box } from "@/components/Box";
import { UserContext } from "@/utils/userContext";
import { useContext } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
    const { userData, setUserData, schoolData } = useContext(UserContext);

    return (
        <ScrollView 
            className="flex-1 bg-white" 
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }} 
            showsVerticalScrollIndicator={false}
        >                    
            <Text className="font-bold text-green-500 text-3xl">Welcome, {userData.firstName}</Text>

            <Text className="font-bold text-xl mt-4">Announcements</Text>

            <Box>
                <Text>No new announcements</Text>
            </Box>

            <Text className="font-bold text-xl mt-8">Today's Events</Text>

            <Box>
                <Text>No events scheduled for today</Text>
            </Box>

            <View className="flex-row justify-center items-center mt-4 gap-2">
                <TouchableOpacity className="items-center mt-8 bg-gray-100 rounded-xl h-full flex-1">
                    <Text className="font-bold text-green-500 text-lg mt-8 text-center">Total Clubs Joined</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center mt-8 bg-gray-100 rounded-xl h-full flex-1">
                    <Text className="font-bold text-green-500 text-lg mt-8">Search Clubs</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center mt-8 bg-gray-100 rounded-xl h-full flex-1">
                    <Text className="font-bold text-green-500 text-lg mt-8">Calendar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}
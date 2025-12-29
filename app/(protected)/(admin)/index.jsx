import { Box } from "@/components/Box";
import { LittleButton } from "@/components/LittleButton";
import { UserContext } from "@/utils/userContext";
import { useContext } from "react";
import { ScrollView, Text, View } from "react-native";

// Component to render school stats to the user
const SchoolStat = ({ title, num }) => {
    return (
        <View className="bg-white rounded-xl flex-1 items-center py-4">
            <Text className="text-green-500 font-bold text-lg text-center leading-tight mb-2">{title}</Text>
            <Text className="text-green-500 font-bold text-3xl">{num}</Text>
        </View>
    )
}

export default function AdminHome() {
    const { userData, schoolData } = useContext(UserContext);

    return (
        <ScrollView 
            className="flex-1 bg-white" 
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }} 
            showsVerticalScrollIndicator={false}
        >
            <Text className="font-bold text-green-500 text-3xl">Welcome, {userData.firstName}</Text>

            {/* Card to display information about the school to the user */}
            <View className="bg-green-500 rounded-3xl p-4 mt-4 mb-4">
                <Text className="text-white font-bold text-3xl">{schoolData.name}</Text>
                <Text className="text-white font-bold text-xl">School Code: {schoolData.id}</Text>
                <View className="flex-row gap-2 mt-3">
                    <SchoolStat title="Total Students" num={schoolData.totalStudents} />
                    <SchoolStat title="Total Clubs" num={schoolData.totalClubs} />
                </View>
            </View>

            <View className="flex-row items-center justify-center mt-4">
                <Text className="font-bold text-xl flex-1">School Announcements</Text>
                <LittleButton text="New" before="plus-circle" />
            </View>
            <Box>
                <Text>No new announcements</Text>
            </Box>

            <View className="flex-row items-center justify-center mt-8">
                <Text className="font-bold text-xl flex-1">Today's Events</Text>
                <LittleButton text="New" before="plus-circle" />
            </View>
            <Box>
                <Text>No events scheduled for today</Text>
            </Box>
        </ScrollView>
        
    )
}
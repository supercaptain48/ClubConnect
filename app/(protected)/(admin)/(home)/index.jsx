import { Box } from "@/components/Box";
import { LittleButton } from "@/components/LittleButton";
import { UserContext } from "@/utils/userContext";
import { useRouter } from "expo-router";
import { collection, doc, getFirestore, onSnapshot, orderBy, query } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { app } from "@/firebaseConfig";
import Animated, { LinearTransition, SlideOutRight } from "react-native-reanimated";
import { AnnouncementCard, AnnouncementModal } from "@/components/AnnouncementCard";
import { MiniEventCard } from "@/components/EventCard";

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
    const { userData, schoolData, setSchoolData } = useContext(UserContext);
    const router = useRouter();
    const [announcements, setAnnouncements] = useState([]);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
    const db = getFirestore(app);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "users", userData.id, "feed"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const feed = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setAnnouncements(feed);
        })

        return () => unsubscribe();
    }, [])

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "schools", schoolData.id),
            (snapshot) => {
                const school = snapshot.data();
                const allEvents = school.events.map((e) => ({...e, clubName: schoolData.name}));

                // Filter events that are in the future and sort by date
                const now = new Date();
                const events = allEvents
                    .filter(e => e.startDate.toDate() >= now)
                    .sort((a, b) => a.startDate.toDate() - b.startDate.toDate());

                setEvents(events);
                setSchoolData(school);
            }
        )

        return () => unsubscribe();
    }, [])

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
                <LittleButton text="New" before="plus-circle" onPress={() => router.push("(admin)/(home)/createAnnouncement")} />
            </View>
            <Box>
                {announcements.length > 0 ? 
                    <FlatList 
                        data={announcements}
                        keyExtractor={(item, index) => item.id}
                        renderItem={({ item }) => (
                            <Animated.View
                                layout={LinearTransition.springify()}
                                exiting={SlideOutRight}
                                className="items-center justify-center"
                            >
                                <TouchableOpacity 
                                    className="items-center justify-center mr-2" 
                                    activeOpacity={0.7}
                                    onPress={() => setSelectedAnnouncementId(item.id)}
                                >
                                    <AnnouncementCard a={item} />
                                    {selectedAnnouncementId === item.id && (
                                        <AnnouncementModal
                                            announcement={item}
                                            modalVisible={true}
                                            setModalVisible={(visible) => !visible && setSelectedAnnouncementId(null)}
                                        />
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                            
                        )}
                        className="w-full"
                        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    /> : <Text>No upcoming announcements</Text>}
            </Box>
        </ScrollView>
        
    )
}
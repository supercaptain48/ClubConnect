import { Box } from "@/components/Box";
import { UserContext } from "@/utils/userContext";
import { collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { app } from "@/firebaseConfig";
import { MiniEventCard } from "@/components/EventCard";
import Animated, { LinearTransition, SlideOutRight } from "react-native-reanimated";
import { AnnouncementCard, AnnouncementModal } from "@/components/AnnouncementCard";

// Component to render school stats to the user
const SchoolStat = ({ title, num }) => {
    return (
        <View className="bg-white rounded-xl flex-1 items-center py-4">
            <Text className="text-green-500 font-bold text-lg text-center leading-tight mb-2">{title}</Text>
            <Text className="text-green-500 font-bold text-3xl">{num}</Text>
        </View>
    )
}

export default function Index() {
    const { userData, setUserData, schoolData } = useContext(UserContext);
    const [events, setEvents] = useState([]);
    const db = getFirestore(app);
    const [announcements, setAnnouncements] = useState([]);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

    useEffect(() => {
        const now = new Date();

        // Set up real-time listener for events from user's clubs
        const combinedClubIds = [...(userData.myClubs || []), ...(userData.clubsJoined || [])];
        if (combinedClubIds.length > 0) {
            const q = query(
                collection(db, "clubs"), 
                where("id", "in", combinedClubIds)
            );
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const allEvents = [];
                querySnapshot.forEach((doc) => {
                    const club = doc.data();
                    if (club?.events) {
                        allEvents.push(...club.events.map((e, idx) => ({
                            ...e,
                            clubName: club.name,
                            id: e.id ?? `${doc.id}_event_${idx}`
                        })));
                    }
                })

                // Filter events that are in the future and sort by date
                const events = allEvents
                    .filter(e => e.startDate.toDate() >= now)
                    .sort((a, b) => a.startDate.toDate() - b.startDate.toDate());

                setEvents(events);
            })

            // Clean up listener on unmount
            return () => unsubscribe();
        }
        
    }, [userData])

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

    return (
        <ScrollView 
            className="flex-1 bg-white" 
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }} 
            showsVerticalScrollIndicator={false}
        >                    
            <View className="bg-green-500 rounded-3xl p-4 mb-4">
                <Text className="font-bold text-white text-3xl">Welcome, {userData.firstName}</Text>
                <View className="flex-row gap-2 mt-3">
                    <SchoolStat title="Total Clubs" num={(userData?.clubsJoined?.length || 0) + (userData?.myClubs?.length || 0)} />
                    <SchoolStat title="Upcoming Events" num={events.length} />
                </View>
            </View>

            <Text className="font-bold text-xl mt-4">Announcements</Text>
            <Box>
                {announcements.length > 0 ? 
                    <FlatList 
                        data={announcements}
                        keyExtractor={(item, index) => item.id}
                        renderItem={({ item }) => (
                            <Animated.View
                                key={item.id}
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

            <Text className="font-bold text-xl mt-8">Upcoming Events</Text>

            <Box>
                {events.length > 0 ? 
                    <FlatList 
                        data={events.slice(0, 3)}
                        keyExtractor={(item, index) => (item.id?.toString() || index.toString())}
                        renderItem={({ item }) => <MiniEventCard e={item} />}
                        className="w-full"
                        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                        scrollEnabled={false}
                    /> : <Text>No upcoming events</Text> }
            </Box>
        </ScrollView>
    )
}
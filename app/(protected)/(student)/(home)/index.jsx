import { Box } from "@/components/Box";
import { UserContext } from "@/utils/userContext";
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { app } from "@/firebaseConfig";
import { MiniEventCard } from "@/components/EventCard";
import Animated, { LinearTransition, SlideOutRight } from "react-native-reanimated";
import { AnnouncementCard, AnnouncementModal } from "@/components/AnnouncementCard";
import { useRouter } from "expo-router";

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
    const [eventCheckIns, setEventCheckIns] = useState([]);
    const router = useRouter();
    const [liveEvents, setLiveEvents] = useState([]);

    useEffect(() => {
        const now = new Date();

        // Set up real-time listener for events from user's clubs
        const combinedClubIds = [...(userData.myClubs || []), ...(userData.clubsJoined || [])];
        if (combinedClubIds.length > 0) {
            // Query clubs where the ID is in the user's combined club IDs
            const q = query(
                collection(db, "clubs"), 
                where("id", "in", combinedClubIds)
            );
            const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                // Create an array of promises for each sub-collection fetch
                const eventPromises = querySnapshot.docs.map(async (clubDoc) => {
                    const club = clubDoc.data();
                    const snapshot = await getDocs(collection(db, "clubs", club.id, "events"));
                    return snapshot.docs.map(eventDoc => ({ 
                        ...eventDoc.data(), 
                        clubName: club.name, 
                        clubId: club.id,
                        id: eventDoc.id 
                    }));
                });

                // Wait for all sub-collection fetches to complete
                const results = await Promise.all(eventPromises);   

                // Flatten the array of arrays into one single list
                const allEvents = results.flat();

                // Filter events that are in the future and sort by date
                const upcoming = allEvents
                    .filter(e => e.startDate.toDate() >= now)
                    .sort((a, b) => a.startDate.toDate() - b.startDate.toDate());

                // Set events and event check-ins
                // Event check-ins are events happening now that the user can check into
                // Users cannot check into events from their own clubs
                // Live events are events happening now from user's own clubs so that they can check attendance
                setEvents(upcoming);
                setEventCheckIns(allEvents.filter(e => now >= e.checkInOpensAt?.toDate() && now <= e.checkInClosesAt?.toDate() && !userData.myClubs?.includes(e.clubId))); 
                setLiveEvents(allEvents.filter(e => now >= e.checkInOpensAt?.toDate() && now <= e.checkInClosesAt?.toDate() && userData.myClubs?.includes(e.clubId)));                
            })

            // Clean up listener on unmount
            return () => unsubscribe();
        }
        
    }, [userData])

    useEffect(() => {
        // Set up real-time listener for announcements from user's feed
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

            {eventCheckIns.length > 0 && <Text className="font-bold text-xl mt-4">Event Check-Ins</Text>}
            {eventCheckIns.length > 0 && 
                <Box>
                    <FlatList 
                        data={eventCheckIns}
                        keyExtractor={(item, index) => (item.id?.toString() || index.toString())}
                        renderItem={({ item }) => (
                            <View className="flex-row items-center justify-center">
                                <View className="flex-1">
                                    <MiniEventCard e={item} closes={true} />
                                </View>

                                <TouchableOpacity
                                    className="bg-green-500 ml-2 px-2 py-1 rounded-lg"
                                    activeOpacity={0.7}
                                    onPress={() => router.push({
                                        pathname: "/(protected)/(student)/(home)/checkIn",
                                        params: { eventId: item.id, clubId: item.clubId }
                                    })}
                                >
                                    <Text className="text-white font-bold text-sm">Check-In</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        scrollEnabled={false}
                        className="w-full"
                        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                    />
                </Box>}

            {liveEvents.length > 0 && <Text className="font-bold text-xl mt-4">Live Events</Text>}
            {liveEvents.length > 0 && 
                <Box>
                    <FlatList 
                        data={liveEvents}
                        keyExtractor={(item, index) => (item.id?.toString() || index.toString())}
                        renderItem={({ item }) => (
                            <View className="flex-row items-center justify-center">
                                <View className="flex-1">
                                    <MiniEventCard e={item} closes={true} />
                                </View>

                                <TouchableOpacity
                                    className="bg-green-500 ml-2 px-2 py-1 rounded-lg"
                                    activeOpacity={0.7}
                                    onPress={() => router.push({
                                        pathname: "/(protected)/(student)/(home)/viewEvent",
                                        params: { eventId: item.id, clubId: item.clubId }
                                    })}
                                >
                                    <Text className="text-white font-bold text-sm">View</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        scrollEnabled={false}
                        className="w-full"
                        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                    />
                </Box>}

            <Text className="font-bold text-xl mt-8">Announcements</Text>
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
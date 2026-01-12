import { app } from "@/firebaseConfig";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { arrayRemove, collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";
import { Box } from "@/components/Box";
import { LittleButton } from "@/components/LittleButton";
import { UserContext } from "@/utils/userContext";
import { MiniEventCard } from "@/components/EventCard";
import Toast from "react-native-toast-message";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import Animated, { FadeIn, FadeOut, LinearTransition, SlideOutRight } from "react-native-reanimated";
import { AnnouncementCard, AnnouncementModal } from "@/components/AnnouncementCard";
import { AntDesign } from "@expo/vector-icons";

export default function ClubPage() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const db = getFirestore(app);
    const [club, setClub] = useState({});
    const { userData } = useContext(UserContext);
    const [events, setEvents] = useState([]);
    const prevEventCountRef = useRef(-1);
    const [announcements, setAnnouncements] = useState([]);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "clubs", params.id, "events"), orderBy("startDate", "desc"));
        let club = {};
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // Get club details
            const clubSnap = await getDoc(doc(db, "clubs", params.id));
            club = clubSnap.data();
            setClub(clubSnap.data());

            // Sort events by date and filter to only upcoming events
            const now = new Date();

            // Get events from snapshot
            const events = snapshot.docs.map(doc => ({ ...doc.data(), clubName: club.name, id: doc.id }))
                .filter(e => e.startDate.toDate() >= now)
                .sort((a, b) => a.startDate.toDate() - b.startDate.toDate());

            // Only show toast if event count increased (and it's not the first load)
            if (prevEventCountRef.current !== -1 && events.length > prevEventCountRef.current) {
                eventCreatedToast();
            }

            // Track the event count
            prevEventCountRef.current = events.length;

            setEvents(events);
        })

        const q2 = query(
            collection(db, "clubs", params.id, "announcements"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe2 = onSnapshot(q2, (snapshot) => {
            const announcements = snapshot.docs.map(doc => ({
                id: doc.id,
                clubName: club.name,
                ...doc.data()
            }));

            setAnnouncements(announcements);
        })

        // Clean up listener on unmount
        return () => (unsubscribe(), unsubscribe2());
    }, [])

    const eventCreatedToast = () => {
        Toast.show({
            text1: "Event created successfully"
        })
    }

    const deleteEvent = async (event) => {
        delete event.clubName;
        await updateDoc(doc(db, "clubs", club.id), {
            events: arrayRemove(event)
        })
    }

    return (
        <View className="bg-white flex-1">
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image 
                    source={club.imageURL ? { uri: club.imageURL } : { uri: 'https://blocks.astratic.com/img/general-img-landscape.png' }}
                    style={{
                        width: "100%",
                        height: 200,
                        borderRadius: 6,
                        backgroundColor: "#eee",
                        alignSelf: "center",
                    }}
                    contentFit="cover"
                />
                <View className="py-4 px-7">
                    <Text className="text-3xl font-bold mb-2">{club.name}</Text>
                    <Text className="text-gray-600">{club.members?.length || 0} members</Text>
                    <Text className="text-gray-800 mt-4 mb-4">{club.description}</Text>

                    <TouchableOpacity 
                        className="bg-green-500 px-3 py-2 rounded-xl flex-row items-center justify-center mb-6"
                        activeOpacity={0.7}
                        onPress={() => router.push(`/(admin)/clubs/${club.id}/members`)}
                    >
                        <Text className="text-white font-bold flex-1">View members</Text>
                        <AntDesign name="right" size={16} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-green-500 px-3 py-2 rounded-xl flex-row items-center justify-center -mt-2 mb-6"
                        activeOpacity={0.7}
                        onPress={() => router.push(`/(admin)/clubs/${club.id}/viewPastEvents`)}
                    >
                        <Text className="text-white font-bold flex-1">View past events</Text>
                        <AntDesign name="right" size={16} color="white" />
                    </TouchableOpacity>

                    <View className="flex-row items-center mt-8 mb-4">
                        <Text className="text-xl font-bold flex-1">Upcoming Events</Text>
                        {userData.myClubs?.includes(club.id) && 
                            <LittleButton text="New" before="plus-circle" onPress={() => router.push(`/(student)/clubs/${club.id}/createEvent`)} />
                        }
                    </View>
                    
                    <Box>
                        {events.length > 0 ? 
                            <FlatList 
                                data={events.slice(0, 3)}
                                keyExtractor={(item, index) => item.name + item.startDate}
                                renderItem={({ item }) => (
                                    <Animated.View
                                        layout={LinearTransition.springify()}
                                        exiting={SlideOutRight}
                                    >
                                        <View className="flex-row items-center justify-center">
                                            <View className="flex-1">
                                                <MiniEventCard e={item} />
                                            </View>
                                            {userData.myClubs?.includes(club.id) && 
                                                <TouchableOpacity 
                                                    className="bg-red-500 rounded-lg px-2 py-1 justify-center ml-2"
                                                    activeOpacity={0.7}
                                                    onPress={() => deleteEvent(item)}
                                                >
                                                    <Text className="font-bold text-white text-sm">Delete</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    </Animated.View>
                                    
                                )}
                                className="w-full"
                                contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                                scrollEnabled={false}
                            /> : <Text>No upcoming events</Text>}
                    </Box>

                    <View className="flex-row items-center mt-8 mb-4">
                        <Text className="text-xl font-bold flex-1">Announcements</Text>
                        {userData.myClubs?.includes(club.id) && <LittleButton text="New" before="plus-circle" onPress={() => router.push(`/(student)/clubs/${club.id}/createAnnouncement`)} />}
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
                </View>
            </ScrollView>
            
        </View>
    )
}
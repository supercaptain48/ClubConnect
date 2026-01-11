import { app } from "@/firebaseConfig";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
    const clubId = club?.id ?? params.id;
    const { userData, setUserData } = useContext(UserContext);
    const [events, setEvents] = useState([]);
    const prevEventCountRef = useRef(-1);
    const [announcements, setAnnouncements] = useState([]);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);

    useEffect(() => {
        let club = {};
        const unsubscribe = onSnapshot(doc(db, "clubs", params.id), (doc) => {
            club = doc.data();
            setClub(club);

            // Sort events by date and filter to only upcoming events
            if (club?.events) {
                const now = new Date();

                const events = [...club.events].sort(
                    (a, b) => a.startDate.toDate() - b.startDate.toDate()
                ).map(e => ({...e, clubName: club.name}))
                .filter(e => e.startDate.toDate() >= now)
                .sort((a, b) => a.startDate.toDate() - b.startDate.toDate());

                // Only show toast if event count increased (and it's not the first load)
                if (prevEventCountRef.current !== -1 && events.length > prevEventCountRef.current) {
                    eventCreatedToast();
                }

                // Track the event count
                prevEventCountRef.current = events.length;

                setEvents(events);
            }
        })

        const q = query(
            collection(db, "clubs", params.id, "announcements"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe2 = onSnapshot(q, (snapshot) => {
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
    
    const handleLeaveClub = async () => {
        setLeaveLoading(true);

        await updateDoc(doc(db, "users", userData.id), {
            clubsJoined: arrayRemove(club.id)
        });

        await updateDoc(doc(db, "clubs", club.id), {
            members: arrayRemove(userData.id)
        });

        setLeaveLoading(false);
    }

    const joinClub = async (club) => {
        setJoinLoading(true);

        await updateDoc(doc(db, "clubs", club.id), {
            members: arrayUnion(userData.id)
        })

        await updateDoc(doc(db, "users", userData.id), {
            clubsJoined: arrayUnion(club.id)
        });

        setJoinLoading(false);
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
                    <Text className="text-gray-600 mb-2 font-semibold">{club.id ? `Code: ${club.id}` : "No code available"}</Text>
                    <View className="flex-row items-center">
                        <Text className="text-gray-600 flex-1">{club.members?.length || 0} members</Text>
                        {userData?.clubsJoined?.includes(clubId) ? 
                            <TouchableOpacity 
                                className="bg-red-500 px-3 py-1 rounded-xl ml-4"
                                activeOpacity={0.7}
                                onPress={handleLeaveClub}
                            >
                                {leaveLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Leave Club</Text>}
                            </TouchableOpacity> : 
                            <TouchableOpacity 
                                className="bg-green-500 px-3 py-1 rounded-xl ml-4"
                                activeOpacity={0.7}
                                onPress={() => joinClub(club)}
                            >
                                {joinLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Join Club</Text>}
                            </TouchableOpacity>
                        }
                    </View>
                    
                    <Text className="text-gray-800 mt-4 mb-4">{club.description}</Text>

                    <TouchableOpacity 
                        className="bg-green-500 px-3 py-2 rounded-xl flex-row items-center justify-center mb-6"
                        activeOpacity={0.7}
                        onPress={() => router.push(`/(student)/clubs/${clubId}/members`)}
                    >
                        <Text className="text-white font-bold flex-1">View members</Text>
                        <AntDesign name="right" size={16} color="white" />
                    </TouchableOpacity>

                    <View className="flex-row items-center mt-8 mb-4">
                        <Text className="text-xl font-bold flex-1">Upcoming Events</Text>
                        {userData?.myClubs?.includes(clubId) && 
                            <LittleButton text="New" before="plus-circle" onPress={() => router.push(`/(student)/clubs/${clubId}/createEvent`)} />
                        }
                    </View>
                    
                    <Box>
                        {events.length > 0 ? 
                            <FlatList 
                                data={events.slice(0, 3)}
                                keyExtractor={(item, index) => (item.id?.toString() || index.toString())}
                                renderItem={({ item }) => (
                                    <Animated.View
                                        layout={LinearTransition.springify()}
                                        exiting={SlideOutRight}
                                    >
                                        <View className="flex-row items-center justify-center">
                                            <View className="flex-1">
                                                <MiniEventCard e={item} />
                                            </View>
                                            {userData?.myClubs?.includes(clubId) && 
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
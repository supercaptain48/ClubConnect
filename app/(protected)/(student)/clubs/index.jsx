import { Box } from "@/components/Box";
import app from "@/firebaseConfig";
import { UserContext } from "@/utils/userContext";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { collection, doc, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function ClubsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const navigation = useNavigation();
    const [clubsJoined, setClubsJoined] = useState([]);
    const { userData } = useContext(UserContext);
    const db = getFirestore(app);
    const [clubsRequested, setClubsRequested] = useState([]);

    // Toast message that will show on the top of the screen as a message to the user
    const showClubRequestToast = () => {
        Toast.show({
            text1: "Club request successfully sent"
        })
    }

    // If the club was successfully requested (the createClub page indicates this using the search params), show the message to the user
    useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'flex' }
        })
        if (params.clubRequested) {
            showClubRequestToast();
        }

        const fetchData = async (updatedUserData) => {
            const joinedCodes = updatedUserData.clubsJoined || [];

            // If there are no clubs joined, set the clubs joined to an empty array
            // Firebase throws an error if we try to query with an empty array
            if (joinedCodes.length > 0) {
                // Going through each club in the database, if the club ID is in the list of codes, get it
                const q = query(collection(db, "clubs"), where("id", "in", joinedCodes));
                const querySnapshot = await getDocs(q);

                const joined = [];
                querySnapshot.forEach((doc) => {
                    joined.push(doc.data());
                })

                setClubsJoined(joined);
            }

            const requestedCodes = updatedUserData.clubsRequested || [];
            if (requestedCodes.length > 0) {
                // Going through each club in the database, if the club ID is in the list of codes, get it
                const q = query(collection(db, "clubs"), where("id", "in", requestedCodes));
                const querySnapshot = await getDocs(q);

                const requested = [];
                querySnapshot.forEach((doc) => {
                    requested.push(doc.data());
                })

                setClubsRequested(requested);
            }
        }
        
        // Set up real-time listener for user data changes
        const unsubscribe = onSnapshot(
            doc(db, "users", userData.id),
            async (snapshot) => {
                const updatedUserData = snapshot.data();
                if (updatedUserData) {
                    fetchData(updatedUserData);
                }
            }
        )

        // Clean up listener on unmount
        return () => unsubscribe();
    }, [])

    // Split the list of clubs so that it can have a sideways scroll with given size in each column
    const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
        }

        return result;
    }

    const RenderClub = ({ club }) => {
        return (
            <TouchableOpacity 
                className="w-80 justify-center items-center px-4 py-2 border-gray-200 mb-2 flex-row" 
                activeOpacity={0.7}
            >
                <Image 
                    source={club.imageURL ? { uri: club.imageURL } : { uri: 'https://blocks.astratic.com/img/general-img-landscape.png' }}
                    style={{
                        width: 75,
                        height: 75,
                        borderRadius: 6,
                        backgroundColor: "#eee",
                        alignSelf: "center",
                    }}
                />
                <View className="flex-1 ml-4">
                    <Text className="text-xl font-bold">{club.name}</Text>
                    <Text className="text-gray-500">{club.members.length} members</Text>
                </View>
            </TouchableOpacity>
        )
        
    }

    return (
        <ScrollView 
            className="bg-white flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }} 
            showsVerticalScrollIndicator={false}
        >
            <View className="flex-row justify-center items-center mt-4 gap-6">
                <TouchableOpacity className="flex-1 mt-4 mb-8 bg-green-500 rounded-xl px-4 py-3 items-center justify-center" activeOpacity={0.7}>
                    <Text className="text-white font-bold">Join with code</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className="flex-1 mt-4 mb-8 bg-green-500 rounded-xl px-4 py-3 items-center justify-center" 
                    activeOpacity={0.7}
                    onPress={() => router.push("(student)/clubs/createClub")}
                >
                    <Text className="text-white font-bold">Create a club</Text>
                </TouchableOpacity>
            </View>

            {clubsRequested.length > 0 && (
                <>
                    <Text className="text-xl font-bold mt-4">Pending Club Requests</Text>
                    <Box>
                        <FlatList 
                            data={chunkArray(clubsRequested, 2)}
                            keyExtractor={(item, index) => `col-${index}`}
                            renderItem={({ item }) => (
                                // Each item is an array of clubs (2 clubs per array)
                                // Render each club in the array vertically stacked
                                <View className="mr-4">
                                    {item.map((club) => (
                                        <RenderClub key={club.id} club={club} />
                                    ))}
                                </View>                        
                            )}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 16 }}
                        />
                    </Box>
                </>
            )}
            
            <Text className="text-xl font-bold mt-4">My Clubs</Text>
            <Box>
                <FlatList 
                    data={chunkArray(clubsJoined, 2)}
                    keyExtractor={(item, index) => `col-${index}`}
                    renderItem={({ item }) => (
                        // Each item is an array of clubs (2 clubs per array)
                        // Render each club in the array vertically stacked
                        <View className="mr-4">
                            {item.map((club) => (
                                <RenderClub key={club.id} club={club} />
                            ))}
                        </View>                        
                    )}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 16 }}
                />
            </Box>

            <Text className="mt-16 text-xl font-bold">Browse All Clubs</Text>

            <Box>
                <Text>No clubs available</Text>
            </Box>
        </ScrollView>
    )
}
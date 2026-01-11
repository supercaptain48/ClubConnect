import { Box } from "@/components/Box";
import { LittleButton } from "@/components/LittleButton";
import app from "@/firebaseConfig";
import { UserContext } from "@/utils/userContext";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition, SlideOutRight } from "react-native-reanimated";
import Toast from "react-native-toast-message";

export default function AdminClubsScreen() {
    const { schoolData, setSchoolData } = useContext(UserContext);
    const [clubRequests, setClubRequests] = useState([]);
    const router = useRouter();
    const [clubs, setClubs] = useState([]);

    useEffect(() => {
        const db = getFirestore(app);
        // Set up real-time listener for school data changes
        // If a student submits a new club request, the school document will update and this listener will trigger
        const unsubscribe = onSnapshot(
            doc(db, "schools", schoolData.id),
            async (snapshot) => {
                // Update school data in context
                const updatedSchoolData = snapshot.data();
                setSchoolData(updatedSchoolData);

                // Fetch pending club approvals
                const clubRequestsCodes = updatedSchoolData.clubRequests;
                // If there are no club requests, set the club requests to an empty array
                // Firebase throws an error if we try to query with an empty array
                if (clubRequestsCodes.length > 0) {
                    // Going through each club in the database, if the club ID is in the list of club request codes, get it
                    const q = query(collection(db, "clubs"), where("id", "in", clubRequestsCodes));
                    const querySnapshot = await getDocs(q);

                    const requests = [];
                    querySnapshot.forEach((doc) => {
                        requests.push(doc.data());
                    })

                    setClubRequests(requests);
                }

                // Fetch all existing clubs in the school
                const clubCodes = updatedSchoolData.clubs;
                // If there are no clubs, set clubs to an empty array
                // Firebase throws an error if we try to query with an empty array
                if (clubCodes.length > 0) {
                    const q = query(collection(db, "clubs"), where("id", "in", clubCodes));
                    const querySnapshot = await getDocs(q);

                    const c = [];
                    querySnapshot.forEach((doc) => {
                        c.push(doc.data());
                    })

                    setClubs(c);
                }
            }
        );
        
        // Clean up listener on unmount
        return () => unsubscribe();
    }, [])

    

    const ClubItem = ({ club, type }) => {
        const [leaderNames, setLeaderNames] = useState([]);
        const [modalVisible, setModalVisible] = useState(false);
        const [approveLoading, setApproveLoading] = useState(false);
        const [denyLoading, setDenyLoading] = useState(false);

        useEffect(() => {
            const fetchLeaderNames = async () => {
                const db = getFirestore(app);
                if (!club?.leaders || club.leaders.length === 0) {
                    setLeaderNames([]);
                    return;
                }

                const userPromises = club.leaders.map(uid => {
                    const docRef = doc(db, "users", uid);
                    return getDoc(docRef);
                });

                const userDocs = await Promise.all(userPromises);
                const names = userDocs
                    .filter(docSnap => docSnap.exists())
                    .map(docSnap => `${docSnap.data().firstName} ${docSnap.data().lastName}`);

                setLeaderNames(names);
            }

            fetchLeaderNames();
        }, [club?.leaders]);

        const showApprovedToast = () => {
            Toast.show({
                text1: "Club approved successfully"
            })
        }

        const showDeniedToast = () => {
            Toast.show({
                text1: "Club denied successfully"
            })
        }

        async function handleApprove() {
            // Approve the club by adding it to the school's list of clubs and removing it from the list of pending requests
            setApproveLoading(true);
            const db = getFirestore(app);
            await updateDoc(doc(db, "schools", schoolData.id), {
                clubRequests: arrayRemove(club.id),
                clubs: arrayUnion(club.id),
                totalClubs: increment(1)
            });
            // Move club from users who requested it to approved
            club.leaders.forEach(async (uid) => {
                await updateDoc(doc(db, "users", uid), {
                    myClubs: arrayUnion(club.id),
                    clubsRequested: arrayRemove(club.id)
                })
            })

            // Remove the club request from the list displayed to the user
            const filteredClubRequests = clubRequests.filter(request => request.id !== club.id);
            setClubRequests(filteredClubRequests);

            setApproveLoading(false);
            setModalVisible(false);
            showApprovedToast();
        }

        async function handleDeny() {
            // Deny the club by removing it from the list of pending requests
            setDenyLoading(true);
            const db = getFirestore(app);
            await updateDoc(doc(db, "schools", schoolData.id), {
                clubRequests: arrayRemove(club.id),
            });
            // Remove club from users who requested it
            club.leaders.forEach(async (uid) => {
                await updateDoc(doc(db, "users", uid), {
                    clubsRequested: arrayRemove(club.id)
                })
            })
            // Delete the club document from the database
            await deleteDoc(doc(db, "clubs", club.id));

            // Remove the club request from the list displayed to the user
            const filteredClubRequests = clubRequests.filter(request => request.id !== club.id);
            setClubRequests(filteredClubRequests);

            setDenyLoading(false);
            setModalVisible(false);
            showDeniedToast();
        }


        return (
            <View>
                <TouchableOpacity 
                    className="w-80 justify-center items-center px-4 py-2 mb-2 flex-row" 
                    activeOpacity={0.7}
                    onPress={() => {
                        // If this component is being used for pending club approvals, show the modal where the club can be approved or denied
                        if(type == "pending") {
                            setModalVisible(true)
                        } else {
                            // If not pending, then it is meant to show club details, so redirect to that screen
                            router.navigate({
                                pathname: '(admin)/clubs/[id]',
                                params: { id: club.id }
                            })
                        }
                    }}
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

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View className="flex-1 justify-center items-center bg-[rgba(0,0,0,0.5)]">
                        <View className="bg-white p-6 pt-14 rounded-lg w-4/5">
                            <TouchableOpacity
                                className="absolute top-4 right-4"
                                activeOpacity={0.7}
                                onPress={() => setModalVisible(false)}
                            >
                                <AntDesign name="close-circle" size={24} color="gray" />
                            </TouchableOpacity>

                            <Text className="text-xl font-bold mb-4">{club.name}</Text>

                            <Image 
                                source={club.imageURL ? { uri: club.imageURL } : { uri: 'https://blocks.astratic.com/img/general-img-landscape.png' }}
                                style={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: 12,
                                    backgroundColor: "#eee",
                                    alignSelf: "center",
                                }}
                            />

                            <Text className="mt-2">Leaders: {leaderNames.join(", ")}</Text>
                            <Text className="mt-2">Club Type: {club.type}</Text>
                            <Text className="mt-2">Description: {club.description}</Text>
                            <TouchableOpacity 
                                className="mt-6 bg-green-500 rounded-xl px-4 py-2 items-center"
                                activeOpacity={0.7}
                                onPress={handleApprove}
                            >
                                <Text className="text-white font-bold">{approveLoading ? <ActivityIndicator color={"white"} /> : 'Approve'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className="mt-4 bg-red-500 rounded-xl px-4 py-2 items-center"
                                activeOpacity={0.7}
                                onPress={handleDeny}
                            >
                                <Text className="text-white font-bold">{denyLoading ? <ActivityIndicator color={"white"} /> : 'Deny'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }

    // Split the list of clubs so that it can have a sideways scroll with given size in each column
    const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
        }

        return result;
    }

    return (
        <View className="bg-white flex-1 px-7 pb-4">          
            <Text className="text-xl font-bold">Pending Club Approvals</Text>
            <Box height="64">
                {clubRequests.length > 0 ? 
                    <FlatList 
                        data={clubRequests}
                        renderItem={({ item }) => (
                            <Animated.View
                                key={item.id}
                                layout={LinearTransition.springify()}
                                exiting={SlideOutRight}
                            >
                                <ClubItem club={item} type="pending" />
                            </Animated.View>
                            
                        )}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        className="w-full"
                        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 10 }}
                    /> : 
                    <Text className="text-center">No pending club requests</Text>}
            </Box>

            <View className="flex-row items-center justify-center mt-8">
                <Text className="flex-1 text-xl font-bold">All Clubs</Text>
                <LittleButton 
                    text="See All" 
                    onPress={() => router.push({
                        pathname: "(admin)/clubs/allClubs",
                        params: { clubs: JSON.stringify(clubs) }
                    })} 
                />
            </View>
            
            <Box>
                {clubs.length > 0 ? 
                    <FlatList 
                        data={chunkArray(clubs, 3)}
                        renderItem={({ item }) => (
                            <Animated.View
                                key={item.map(c => c.id).join(',')}
                                layout={LinearTransition.springify()}
                                exiting={SlideOutRight}
                            >
                                <View className="mr-4">
                                    {item.map((club) => (
                                        <ClubItem key={club.id} club={club} type="club" />
                                    ))}
                                </View>  
                            </Animated.View>
                            
                        )}
                        keyExtractor={(item, index) => item.map(c => c.id).join(',')}
                        showsVerticalScrollIndicator={false}
                        className="w-full"
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 10 }}
                    /> : 
                    <Text className="text-center">No existing clubs</Text>}
            </Box>
        </View>
    )
}
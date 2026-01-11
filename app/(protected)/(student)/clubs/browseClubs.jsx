import { AntDesign, Ionicons } from "@expo/vector-icons";
import { arrayUnion, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { app } from "@/firebaseConfig";
import { UserContext } from "@/utils/userContext";
import { RenderClub } from "@/components/RenderClub";
import { Image } from "expo-image";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

export default function BrowseClubsScreen() {
    const [search, setSearch] = useState("");
    const [modalLeaders, setModalLeaders] = useState([]);
    const db = getFirestore(app);
    const { userData, schoolData, setSchoolData, setUserData } = useContext(UserContext);
    const [clubs, setClubs] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalClub, setModalClub] = useState({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "users", userData.id), 
            async (snapshot) => {
                const updatedUserData = snapshot.data();

                const schoolSnap = await getDoc(doc(db, "schools", schoolData.id));
                const updatedSchoolData = schoolSnap.data();

                const clubCodes = updatedSchoolData.clubs;
                if (clubCodes.length > 0) {
                    const q = query(
                        collection(db, "clubs"), 
                        where("id", "in", clubCodes), 
                        where("type", "==", "Public")
                    );

                    const querySnapshot = await getDocs(q);

                    const c = [];
                    const excludeIds = [
                        ...(updatedUserData?.myClubs || []),
                        ...(updatedUserData?.clubsJoined || [])
                    ];

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (!excludeIds.includes(data.id)) {
                            c.push(data);
                        }
                    });

                    setClubs(c);
                    setFilteredData(c);
                    setSchoolData(updatedSchoolData);
                    setUserData(updatedUserData);
                }
            }
        )

        return () => unsubscribe();
    }, [])

    useEffect(() => {
        const fetchLeaders = async () => {
            const leaders = [];
            if (modalClub.leaders) {
                for (const id of modalClub.leaders) {
                    const docSnap = await getDoc(doc(db, "users", id));
                    const user = docSnap.data();
                    leaders.push(user.firstName + " " + user.lastName);
                }
            }
            setModalLeaders(leaders);
        }
        
        fetchLeaders();
    }, [modalClub, modalVisible])

    const handleSearch = (text) => {
        setSearch(text);
        if (text) {
            const newData = clubs.filter((club) => {
                const itemData = club.name ? club.name.toUpperCase() : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            })
            setFilteredData(newData);
        } else {
            setFilteredData(clubs);
        }
    }
    
    const joinClub = async (club) => {
        setLoading(true);

        await updateDoc(doc(db, "clubs", club.id), {
            members: arrayUnion(userData.id)
        })

        await updateDoc(doc(db, "users", userData.id), {
            clubsJoined: arrayUnion(club.id)
        });
        const c = clubs.filter(c => c.id !== club.id);

        setClubs(c);
        setFilteredData(c);

        setModalVisible(false);
        showJoinedToast();
        setLoading(false);
    }

    const showJoinedToast = () => {
        Toast.show({
            text1: "Club joined successfully"
        })
    }

    return (
        <View className="bg-white px-7 pt-4 flex-1">
            <Text className="text-3xl font-bold text-green-500 mt-4">Browse Clubs</Text>

            <View className="flex-row items-center justify-center mt-4 border border-gray-400 rounded-3xl px-3 py-1 mb-6">
                <Ionicons name="search" size={20} color="gray" className="mr-1" />
                <TextInput 
                    className="flex-1 rounded-xl"
                    placeholder="Search clubs..."
                    value={search}
                    onChangeText={handleSearch}
                />
            </View>

            {clubs.length > 0 ? 
                <FlatList 
                    data={filteredData}
                    renderItem={({ item }) => (
                        // <Animated.View
                        //     layout={LinearTransition.springify()}
                        //     exiting={SlideOutRight}
                        // >
                            // <RenderClub club={item} onPress={() => (setModalVisible(true), setModalClub(item))} /> 
                            <RenderClub club={item} onPress={() => router.push(`/(student)/clubs/${item.id}`)} /> 
                        // </Animated.View>
                        
                    )}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    className="w-full"
                    contentContainerStyle={{ paddingVertical: 16 }}
                /> : 
                <Text className="text-center">No existing clubs</Text>}

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

                        <Text className="text-xl font-bold mb-4">{modalClub.name}</Text>
                        
                        <Image 
                            source={modalClub.imageURL ? { uri: modalClub.imageURL } : { uri: 'https://blocks.astratic.com/img/general-img-landscape.png' }}
                            style={{
                                width: 150,
                                height: 150,
                                borderRadius: 12,
                                backgroundColor: "#eee",
                                alignSelf: "center",
                            }}
                        />
                        <Text className="mt-2">Leaders: {modalLeaders.join(", ")}</Text>
                        <Text className="mt-2">Description: {modalClub.description}</Text>

                        <TouchableOpacity 
                            className="mt-6 bg-green-500 rounded-xl px-4 py-2 items-center"
                            activeOpacity={0.7}
                            onPress={() => joinClub(modalClub)}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Join Club</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
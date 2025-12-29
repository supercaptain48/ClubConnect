import { app } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminAllClubsScreen() {
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const clubs = params.clubs ? JSON.parse(params.clubs) : [];
    const [filteredData, setFilteredData] = useState(clubs);
    const [search, setSearch] = useState("");

    // Hides the bottom tab bar when this screen is opened, as it is not one of the tabs
    // In order for the tab bar to show again when exiting this screen, it returns a function setting that makes it visible again
    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'none' },
        })

        return () => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'flex' },
            })
        }
    }, [navigation])

    const ClubItem = ({ club }) => {
        const [leaderNames, setLeaderNames] = useState([]);

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

        return (
            <TouchableOpacity 
                className="w-full justify-center px-4 py-2 border-b border-gray-200 mb-2" 
                activeOpacity={0.7}
            >
                <Text className="text-xl font-bold">{club.name}</Text>
                <Text>{leaderNames.join(", ")}</Text>
            </TouchableOpacity>
        )
    }

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

    return (
        <SafeAreaView className="bg-white flex-1 px-7 py-4">
            <Text className="text-3xl font-bold text-green-500">All Clubs</Text>

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
                            <ClubItem club={item} />
                        // </Animated.View>
                        
                    )}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    className="w-full"
                    contentContainerStyle={{ paddingVertical: 16 }}
                /> : 
                <Text className="text-center">No existing clubs</Text>}
        </SafeAreaView>
    )
}
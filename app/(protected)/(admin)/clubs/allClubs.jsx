import { app } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RenderClub } from "@/components/RenderClub";

export default function AdminAllClubsScreen() {
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const clubs = params.clubs ? JSON.parse(params.clubs) : [];
    const [filteredData, setFilteredData] = useState(clubs);
    const [search, setSearch] = useState("");
    const router = useRouter();

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
        <SafeAreaView className="bg-white flex-1 px-7" edges={['top', 'left', 'right']}>
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
                            <RenderClub club={item} onPress={() => router.push(`/(admin)/clubs/${item.id}`)} />
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
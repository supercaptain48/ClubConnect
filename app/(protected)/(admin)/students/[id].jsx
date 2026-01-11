import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { app } from "@/firebaseConfig";
import { Image } from "expo-image";
import { Box } from "@/components/Box";
import { RenderClub } from "@/components/RenderClub";

export default function StudentDetailsScreen() {
    const params = useLocalSearchParams();
    const db = getFirestore(app);
    const [student, setStudent] = useState({});
    const [clubsCreated, setClubsCreated] = useState([]);
    const [clubsJoined, setClubsJoined] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "users", params.id),
            async (snapshot) => {
                const s = snapshot.data();

                const joinedCodes = s.clubsJoined || [];
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

                const myClubsCodes = s.myClubs || [];
                if (myClubsCodes.length > 0) {
                    // Going through each club in the database, if the club ID is in the list of codes, get it
                    const q = query(collection(db, "clubs"), where("id", "in", myClubsCodes));
                    const querySnapshot = await getDocs(q);
    
                    const mine = [];
                    querySnapshot.forEach((doc) => {
                        mine.push(doc.data());
                    })
    
                    setClubsCreated(mine);
                }

                setStudent(s);
            }
        );

        return () => unsubscribe();
    });

    const RenderStat = ({ label, value }) => {
        return (
            <View className="flex-row mb-2">
                <Text className="font-bold text-lg flex-1">{label}</Text>
                <Text className="text-gray-500">{value}</Text>
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
        <SafeAreaView className="flex-1 bg-white px-7" edges={['left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-center mb-4">
                    <Image 
                        source={student.imageURL ? { uri: student.imageURL } : { uri: 'https://blocks.astratic.com/img/general-img-landscape.png' }}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 48,
                            backgroundColor: "#eee",
                            alignSelf: "center",
                        }}
                    />
                    <View className="flex-1 ml-6 justify-center">
                        <Text className="text-2xl font-bold">{student.firstName + " " + student.lastName}</Text>
                        <Text className="text-gray-500">{student.role}</Text>
                    </View>
                </View>

                <View className="mb-6">
                    <Box>
                        <View className="px-4 w-full items-center justify-center">
                            <Text className="text-2xl font-extrabold mb-4 mt-6 w-full text-green-500">Student Information</Text>
                            <RenderStat label={"Name"} value={student.firstName + " " + student.lastName} />
                            <RenderStat label={"Email"} value={student.email} />
                            <RenderStat label={"Clubs Created"} value={student.myClubs?.length || 0} />
                            <RenderStat label={"Clubs Joined"} value={student.clubsJoined?.length || 0} />
                        </View>
                    </Box>
                </View>

                {clubsCreated.length > 0 && 
                    <View className="bg-green-500 rounded-3xl p-4 mb-4 items-center">
                        <Text className="text-white font-bold text-3xl w-full mb-2">Clubs Created</Text>
                        <FlatList 
                            data={clubsCreated}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <RenderClub key={item.id} club={item} />}
                            scrollEnabled={false}
                            className="w-full"
                            contentContainerStyle={{ paddingVertical: 16, backgroundColor: "white", borderRadius: 12 }}
                        />
                    </View>
                }

                <Text className="text-xl font-bold mt-4">Clubs Joined</Text>
                <Box>
                    {clubsJoined.length > 0 ? 
                        <FlatList 
                            data={chunkArray(clubsJoined, 3)}
                            keyExtractor={(item, index) => `col-${index}`}
                            renderItem={({ item }) => (
                                // Each item is an array of clubs (2 clubs per array)
                                // Render each club in the array vertically stacked
                                <View className="mr-4">
                                    {item.map((club) => (
                                        <RenderClub key={club.id} club={club} onPress={() => router.push(`(student)/clubs/${club.id}`)} />
                                    ))}
                                </View>                        
                            )}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            className="w-full"
                            contentContainerStyle={{ paddingVertical: 16 }}
                        /> : <Text>No clubs joined</Text>
                    }
                </Box>
            </ScrollView>
            
        </SafeAreaView>
    )
}
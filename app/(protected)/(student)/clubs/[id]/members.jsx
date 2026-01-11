import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { arrayRemove, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { app } from "@/firebaseConfig";
import { Image } from "expo-image";
import { UserContext } from "@/utils/userContext";
import Animated, { LinearTransition, SlideOutRight } from "react-native-reanimated";
import { RenderMember } from "@/components/RenderMember";

export default function ViewMembersScreen() {
    const params = useLocalSearchParams();
    const db = getFirestore(app);
    const [members, setMembers] = useState([]);
    const { userData } = useContext(UserContext);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "clubs", params.id), 
            async (snapshot) => {
                const club = snapshot.data();

                // Handle empty members list
                if (!club?.members || club.members.length === 0) {
                    setMembers([]);
                    return;
                }

                // Fetch user details for the IDs in the club
                const q = query(collection(db, "users"), where("id", "in", club.members));
                const querySnapshot = await getDocs(q);
                const memberData = querySnapshot.docs.map(doc => doc.data());
                
                setMembers(memberData);
            }
        )        

        return () => unsubscribe();
    }, [])

    const handleRemove = async (member) => {
        

        await updateDoc(doc(db, "clubs", params.id), {
            members: arrayRemove(member.id)
        });

        await updateDoc(doc(db, "users", member.id), {
            clubsJoined: arrayRemove(params.id)
        });

        console.log("done");
    }

    return (
        <View className="bg-white flex-1 px-7">
            <FlatList 
                data={members}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Animated.View
                        layout={LinearTransition.springify()}
                        exiting={SlideOutRight}
                    >
                        <View className="flex-row items-center justify-center">
                            <View className="flex-1">
                                <RenderMember member={item} />
                            </View>
                            {userData.myClubs?.includes(params.id) && 
                                <TouchableOpacity
                                    className="bg-red-500 px-3 py-1 rounded-xl"
                                    activeOpacity={0.7}
                                    onPress={() => handleRemove(item)}
                                >
                                    <Text className="font-bold text-white text-sm">Remove</Text>
                                </TouchableOpacity>
                            }
                        </View>
                        
                    </Animated.View>
                    
                )}
            />
        </View>
    )
}
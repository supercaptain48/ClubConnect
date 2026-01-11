import { collection, doc, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "@/utils/userContext";
import app from "@/firebaseConfig";
import Animated, { LinearTransition, SlideOutRight } from "react-native-reanimated";
import { RenderMember } from "@/components/RenderMember";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function StudentsLayout() {
    const { schoolData, setSchoolData } = useContext(UserContext);
    const db = getFirestore(app);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "schools", schoolData.id),
            async (snapshot) => {
                const school = snapshot.data();

                // Handle empty students list
                if (!school?.students || school.students.length === 0) {
                    setStudents([]);
                    return;
                }

                // Fetch user details for the IDs in the school
                const q = query(collection(db, "users"), where("id", "in", school.students));
                const querySnapshot = await getDocs(q);
                const usersData = querySnapshot.docs.map(doc => doc.data());

                setStudents(usersData);
                setFilteredData(usersData);
                setSchoolData(school);
            }
        )

        return () => unsubscribe();
    }, [])

    const handleSearch = (text) => {
        setSearch(text);
        if (text) {
            const newData = students.filter((student) => {
                const itemData = student.firstName + student.lastName ? student.firstName.toUpperCase() + student.lastName.toUpperCase() : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            })
            setFilteredData(newData);
        } else {
            setFilteredData(students);
        }
    }

    return (
        <SafeAreaView className="bg-white flex-1 px-7" edges={['left', 'right']}>
            <View className="flex-row items-center justify-center border border-gray-400 rounded-3xl px-3 py-1 mb-6">
                <Ionicons name="search" size={20} color="gray" className="mr-1" />
                <TextInput 
                    className="flex-1 rounded-xl"
                    placeholder="Search students..."
                    value={search}
                    onChangeText={handleSearch}
                />
            </View>
             <FlatList 
                data={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            router.navigate({
                                pathname: '(admin)/students/[id]',
                                params: { id: item.id }
                            })
                        }}
                    >
                        <RenderMember member={item} />
                    </TouchableOpacity>
                    
                    
                )}
            />
        </SafeAreaView>
    )
}
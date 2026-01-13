import { useContext, useEffect, useState } from "react";
import { FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "@/utils/userContext";
import { useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query } from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { AttendanceEventCard } from "@/components/EventCard";

export default function AttendanceRecordScreen() {
    const { userData } = useContext(UserContext);
    const params = useLocalSearchParams();
    const db = getFirestore(app);
    const [attendance, setAttendance] = useState([]);
    const [attended, setAttended] = useState();

    useEffect(() => {
        const fetchData = async () => {
            // Only get 10 most recent events
            const q = query(
                collection(db, "clubs", params.id, "events"),
                orderBy("startDate", "desc"),
                limit(10)
            )

            const eventsSnapshot = await getDocs(q);
            
            const attendanceRecords = [];

            for (const eventDoc of eventsSnapshot.docs) {
                const eventData = eventDoc.data();

                const attendanceRef = doc(db, "clubs", params.id, "events", eventDoc.id, "attendance", userData.id);
                const attendanceSnap = await getDoc(attendanceRef);

                attendanceRecords.push({
                    ...eventData,
                    id: eventDoc.id,
                    attended: attendanceSnap.exists(),
                    checkedInAt: attendanceSnap.exists() ? attendanceSnap.data().checkedInAt : null
                });
            }

            setAttendance(attendanceRecords);
            setAttended(attendanceRecords.filter(record => record.attended).length);
        }

        fetchData();
    }, [])

    return (
        <SafeAreaView className="bg-white flex-1 px-7" edges={['left', 'right']}>
            <Text className="font-bold text-green-500 text-xl mb-4">{attended} of last {attendance.length} events attended</Text>
            <FlatList 
                data={attendance}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <AttendanceEventCard e={item} attended={item.attended} />}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    )
}
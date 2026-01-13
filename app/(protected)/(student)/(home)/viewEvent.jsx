import { useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { app } from "@/firebaseConfig";
import { RenderMember } from "@/components/RenderMember";

export default function ViewEventScreen() {
    const params = useLocalSearchParams();
    const db = getFirestore(app);
    const [attendees, setAttendees] = useState([]);
    const [event, setEvent] = useState({});

    useEffect(() => {
        const fetchEvent = async () => {
            const eventSnap = await getDoc(doc(db, "clubs", params.clubId, "events", params.eventId));
            setEvent(eventSnap.data());
        }

        fetchEvent();

        const q = collection(db, "clubs", params.clubId, "events", params.eventId, "attendance");

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const ids = snapshot.docs.map(doc => doc.id)

            const attendees = [];
            for (const id of ids) {
                const docSnap = await getDoc(doc(db, "users", id));
                attendees.push(docSnap.data());
            }
            setAttendees(attendees);
        })

        return () => unsubscribe();
    }, [])

    return (
        <SafeAreaView className="bg-white flex-1 px-7" edges={['left', 'right']}>
            <Text className="text-2xl font-bold text-green-500">{event.name}</Text>
            <Text className="font-bold">Code: {event.code}</Text>
            <Text className="text-gray-500 mt-1 mb-8">{attendees.length} students checked in</Text>

            <Text className="text-lg font-bold mb-4">Attendees:</Text>
            <FlatList 
                data={attendees}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RenderMember member={item} />}
            />
        </SafeAreaView>
    )
}
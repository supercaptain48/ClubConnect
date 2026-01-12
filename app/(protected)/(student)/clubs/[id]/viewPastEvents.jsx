import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { app } from "@/firebaseConfig";
import { EventCard } from "@/components/EventCard";

export default function ViewPastEventsScreen() {
    const params = useLocalSearchParams();
    const db = getFirestore(app);
    const [events, setEvents] = useState([]);
    const [club, setClub] = useState({});
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const clubSnap = await getDoc(doc(db, "clubs", params.id));
            const club = clubSnap.data();
            setClub(club);

            const snapshot = await getDocs(collection(db, "clubs", params.id, "events"), orderBy("startDate", "desc"));
            const e = snapshot.docs.map(doc => ({ ...doc.data(), clubName: club.name, id: doc.id, clubId: params.id }));
            setEvents(e);
        }
        
        fetchData();
    }, [])

    return (
        <SafeAreaView className="bg-white flex-1 px-7" edges={['left', 'right']}>
            <FlatList 
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <EventCard e={item} onPress={
                        () => router.push({
                            pathname: `/(student)/clubs/${params.id}/viewEvent`,
                            params: { eventId: item.id, clubId: item.clubId }
                        })
                    }/>
                )}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    )
}
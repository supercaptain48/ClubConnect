import { useContext, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Calendar, CalendarList } from "react-native-calendars";
import { UserContext } from "@/utils/userContext";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { EventCard } from "@/components/EventCard";

export default function EventsScreen() {
    const [selected, setSelected] = useState('');
    const { userData } = useContext(UserContext);
    const [events, setEvents] = useState([]);
    const db = getFirestore(app);
    const [markedDates, setMarkedDates] = useState({});
    const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState([]);

    useEffect(() => {
        if (!userData?.myClubs && !userData?.clubsJoined) return;

        const fetchEvents = async () => {
            const allEvents = [];

            // Fetch events from user's clubs
            if (userData.myClubs) {
                for (const id of userData.myClubs) {
                    const docSnap = await getDoc(doc(db, "clubs", id));
                    const club = docSnap.data();
                    if (club?.events) {
                        allEvents.push(...club.events.map(e => ({...e, clubName: club.name})));
                    }
                }
            }

            // Fetch events from clubs the user has joined
            if (userData.clubsJoined) {
                for (const id of userData.clubsJoined) {
                    const docSnap = await getDoc(doc(db, "clubs", id));
                    const club = docSnap.data();
                    if (club?.events) {
                        allEvents.push(...club.events.map(e => ({...e, clubName: club.name})));
                    }
                }
            }

            setEvents(allEvents);

            const marked = {};
            allEvents.forEach(e => {
                const dateStr = toDateString(e.startDate.toDate());

                marked[dateStr] = {
                    marked: true,
                    dotColor: "#22c55e"
                };
            });

            setMarkedDates(marked);
        };

        fetchEvents();
        
    }, [userData])

    // Update events on selected date when selected date changes
    useEffect(() => {
        setEventsOnSelectedDate(events.filter(e => {
            return (
                toDateString(e.startDate.toDate()) === selected
            )
        }))
    }, [selected])

    // Helper function to convert Date object to 'YYYY-MM-DD' format
    const toDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Helper function to format date for display
    // example: 2024-09-15 -> September 15, 2024
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split("-");

        const date = new Date(year, month - 1, day);

        return new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        }).format(date);
    }

    return (
        <View className="bg-white flex-1">
            <CalendarList 
                onDayPress={(day) => {
                    setSelected(day.dateString)
                }}
                markedDates={{
                    ...markedDates,
                    [selected]: { 
                        ...markedDates[selected],
                        selected: true, 
                        disableTouchEvent: true, 
                        selectedDotColor: 'orange' 
                    }
                }}
                horizontal={true}
                pagingEnabled={true}
                hideArrows={false}
            />
            

            <ScrollView className="px-7" showsVerticalScrollIndicator={false}>
                {selected && <Text className="text-2xl font-bold mb-4">Events on {formatDate(selected)}</Text>}
                {eventsOnSelectedDate.map((e, index) => 
                    <EventCard key={index} e={e} />
                )}
                {eventsOnSelectedDate.length === 0 && 
                    <Text className="text-gray-600">No events on this date.</Text>
                }
            </ScrollView>
        </View>
    )
}
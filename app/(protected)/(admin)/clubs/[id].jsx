import { app } from "@/firebaseConfig";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ClubPage() {
    const params = useLocalSearchParams();
    const navigation = useNavigation();
    const db = getFirestore(app);
    const [club, setClub] = useState({});

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

    useEffect(() => {
        const fetchData = async () => {
            const docSnap = await getDoc(doc(db, "clubs", params.id));
            setClub(docSnap.data());
        }

        fetchData();
    }, [])

    return (
        <SafeAreaView className="bg-white flex-1 px-7">
            <Text>{club.name}</Text>
        </SafeAreaView>
    )
}
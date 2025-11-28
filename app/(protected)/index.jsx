import { app, auth } from "@/firebaseConfig";
import { UserContext } from "@/utils/userContext";
import { Redirect, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedIndex() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { userData, setUserData } = useContext(UserContext);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setUser(null);
                setLoading(false);
                return;
            }

            setUser(user);
            try {
                const db = getFirestore(app);
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    
                    // Check if school is set; if not, navigate to setup
                    if (!data.schoolID) {
                        if (data.role === "Student") {
                            router.replace("/studentSetup");
                        } else if (data.role === "Administrator") {
                            router.replace("/adminSetup");
                        }
                    } else {
                        // School is set, go to main app
                        router.replace("/(tabs)");
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [router]);

    if (loading) {
        return (
            <View className="bg-white flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    // Should not reach here as navigation happens in useEffect
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
}

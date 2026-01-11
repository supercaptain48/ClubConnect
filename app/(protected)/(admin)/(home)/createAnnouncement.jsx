import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { LoginInput } from "@/components/LoginInput";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useContext, useState } from "react";
import { addDoc, arrayUnion, collection, doc, getDoc, getFirestore, serverTimestamp, updateDoc } from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { app } from "@/firebaseConfig";
import { UserContext } from "@/utils/userContext";

export default function CreateAnnouncementScreen() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [titleError, setTitleError] = useState(false);
    const [messageError, setMessageError] = useState(false);
    const db = getFirestore(app);
    const { userData, schoolData } = useContext(UserContext);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setTitleError(false);
        setMessageError(false);
        let errorExists = false;

        if(!title) {
            setTitleError(true);
            errorExists = true;
        }
        if(!message) {
            setMessageError(true);
            errorExists = true;
        }

        if (errorExists) {
            return;
        }

        setLoading(true);

        const announcementData = {
            createdBy: userData.id,
            title: title,
            message: message,
            clubName: schoolData.name,
            createdAt: serverTimestamp(),
        }

        // Add announcement to the school
        await addDoc(
            collection(db, "schools", schoolData.id, "announcements"), 
            announcementData
        );
        // Send to all students
        schoolData.students.forEach((userId) => {
            addDoc(
                collection(db, "users", userId, "feed"),
                announcementData
            )
        });
        // Send to admin
        addDoc(
            collection(db, "users", schoolData.adminID, "feed"),
            announcementData
        )

        router.back();
    }

    return (
        <KeyboardAvoidingView className="bg-white flex-1 justify-center px-7" behavior="padding">
            {titleError && <Text className="text-center font-bold text-red-500 mb-1">Title is required</Text>}
            <LoginInput text="Title" onChangeText={setTitle} />

            {messageError && <Text className="text-center font-bold text-red-500 mb-1">Message is required</Text>}
            <LoginInput text="Message" onChangeText={setMessage} multiline={true} style={{ minHeight: 120, textAlignVertical: "top" }} />

            <TouchableOpacity 
                className="bg-green-500 rounded-xl px-4 py-3 items-center justify-center mt-6" 
                activeOpacity={0.7}
                onPress={handleSubmit}
            >
                {loading ? <ActivityIndicator color={"white"} /> : <Text className="text-white font-bold">Create Announcement</Text>}
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}
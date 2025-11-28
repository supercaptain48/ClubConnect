import { LoginInput } from "@/components/LoginInput";
import { app } from "@/firebaseConfig";
import { UserContext } from "@/utils/userContext";
import { useRouter } from "expo-router";
import { collection, doc, getDocs, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { useContext, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function AdminSetupScreen() {
    const { userData, setUserData } = useContext(UserContext);
    const router = useRouter();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const generateRandomCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    async function handleCreateSchool() {
        setLoading(false);
        // If name or address isn't provided, return an error
        if (!name || !address) {
            setError(true);
            return;
        }

        setLoading(true);

        try {
            let newCode = generateRandomCode(); 

            // Get list of existing school codes to make sure there are no duplicates
            const db = getFirestore(app);
            const schoolRef = collection(db, "schools");
            const querySnapshot = await getDocs(schoolRef);
            const existingCodes = [];
            querySnapshot.forEach((doc) => {
                existingCodes.push(doc.id);
            })
            while (existingCodes.includes(newCode)) {
                newCode = generateRandomCode();
            }
            await setDoc(doc(db, "schools", newCode), {
                id: newCode,
                name: name,
                address: address,
                adminID: userData.id
            })
            await updateDoc(doc(db, "users", userData.id), {
                schoolID: newCode
            })
            setLoading(false);
            router.replace("(tabs)");
        } catch (err) {
            console.error("Error creating school:", err);
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView className="flex-1 justify-center px-8 bg-white" behavior="padding">
            <Text className="font-bold text-green-500 text-4xl mb-6 text-center">Welcome, {userData.firstName}</Text>
            <Text className="font-bold text-2xl text-center mb-4">Add Your School</Text>

            {error && <Text className="text-center font-bold text-red-500 mb-1">Name and address required</Text>}
            <LoginInput 
                text="ex. Crestview High School" 
                label="Enter School name" 
                onChangeText={setName} 
                autoCapitalize="words" 
            />
            <LoginInput 
                text="ex. 123 Main Street, Anytown, USA" 
                label="Enter School Address" 
                onChangeText={setAddress} 
                autoCapitalize="words"  
            />

            <TouchableOpacity 
                className="bg-green-500 justify-center items-center py-3 rounded-2xl mt-4 w-full" 
                onPress={handleCreateSchool} 
                activeOpacity={0.7}
            >
                {loading ? <ActivityIndicator color="white" /> :
                    <Text className="font-bold text-lg text-white">Create School</Text>
                }
            </TouchableOpacity>

        </KeyboardAvoidingView>
    )
}
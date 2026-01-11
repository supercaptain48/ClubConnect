import { auth } from "@/firebaseConfig";
import { AuthContext } from "@/utils/authContext";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useContext } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/Box";
import { UserContext } from "@/utils/userContext";
import { Image } from "expo-image";
import * as ImagePicker from 'expo-image-picker';
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "@/firebaseConfig";

export default function SchoolSettingsScreen() {
    const authState = useContext(AuthContext);
    const router = useRouter();
    const { userData, schoolData, setUserData } = useContext(UserContext);
    const db = getFirestore(app);

    const RenderStat = ({ label, value }) => {
        return (
            <View className="flex-row">
                <Text className="font-bold text-lg flex-1">{label}</Text>
                <Text className="text-gray-500">{value}</Text>
            </View>
        )
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }

        return null;
    }

    const uploadToCloudinary = async (uri) => {
        const data = new FormData();

        data.append("file", {
            uri,
            type: "image/jpeg",
            name: "profile.jpg",
        });

        data.append("upload_preset", "profile_pictures");

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/dptnmralr/image/upload",
            {
                method: "POST",
                body: data,
            }
        );

        const json = await res.json();
        return json.secure_url;
    }

    const changePicture = async () => {
        const uri = await pickImage();
        if (!uri) return;

        const url = await uploadToCloudinary(uri);
        
        await updateDoc(doc(db, "users", userData.id), {
            imageURL: url
        })
        
        setUserData((prev) => ({
            ...prev,
            imageURL: url
        }))
    }

    function signout() {
        signOut(auth)
            .then(() => {
                console.log("Successfully logged out");
                router.replace("/login");
            })
            .catch((error) => {
                console.log("Error signing out: ", error);
            })
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-7">
            <View className="mt-2 flex-row items-center justify-center mb-4">
                <View>
                    <Image 
                        source={userData.imageURL ? { uri: userData.imageURL } : { uri: 'https://blocks.astratic.com/img/general-img-landscape.png' }}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 48,
                            backgroundColor: "#eee",
                            alignSelf: "center",
                        }}
                    />
                    <TouchableOpacity
                        className="bg-green-500 rounded-xl p-1 absolute bottom-0 right-0"
                        activeOpacity={0.7}
                        onPress={changePicture}
                    >
                        <Text className="text-white font-bold text-sm text-center">Edit</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-1 ml-6 justify-center">
                    <Text className="text-2xl font-bold">{userData.firstName + " " + userData.lastName}</Text>
                    <Text className="text-gray-500">{userData.role}</Text>
                </View>
            </View>

            <View className="mb-2">
                <Box>
                    <View className="px-4 w-full items-center justify-center gap-2">
                        <Text className="text-2xl font-extrabold mb-4 w-full text-green-500">{schoolData.name}</Text>
                        <RenderStat label={"School Code"} value={schoolData.id} />
                        <RenderStat label={"Address"} value={schoolData.address} />
                        <RenderStat label={"Students"} value={schoolData.totalStudents} />
                        <RenderStat label={"Clubs"} value={schoolData.totalClubs} />
                    </View>
                </Box>
                
                
            </View>

            <View className="mb-2">
                <Box>
                    <View className="px-4 w-full items-center justify-center gap-2">
                        <Text className="text-2xl font-extrabold mb-4 w-full text-green-500">Your Account</Text>
                        <RenderStat label={"Name"} value={userData.firstName + " " + userData.lastName} />
                        <RenderStat label={"Email"} value={userData.email} />
                    </View>
                </Box>
            </View>

            
            <TouchableOpacity
                className="bg-red-500 justify-center items-center py-3 rounded-2xl mt-4"
                activeOpacity={0.7}
                onPress={signout}
            >
                <Text className="text-white font-bold">Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
        
    )
}
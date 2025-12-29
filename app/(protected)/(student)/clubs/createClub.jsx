import { LoginInput } from "@/components/LoginInput";
import { Selector } from "@/components/Selector";
import { app } from "@/firebaseConfig";
import { UserContext } from "@/utils/userContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { arrayUnion, collection, doc, getDocs, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { useContext, useLayoutEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateClubScreen() {
    const navigation = useNavigation();
    const [selectedType, setSelectedType] = useState("");
    const router = useRouter();
    const [clubName, setClubName] = useState("");
    const [clubDescription, setClubDescription] = useState("");
    const [clubTypeError, setClubTypeError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const { userData } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [imageURL, setimageURL] = useState();
    const [imageError, setImageError] = useState(false);

    // Hides the bottom tab bar when this screen is opened, as it is not one of the tabs
    // In order for the tab bar to show again when exiting this screen, it returns a function setting that makes it visible again
    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'none' }
        })

        return () => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'flex' }
            })
        }
    }, [navigation])

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

        data.append("upload_preset", "club_profile_pictures");

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
        setimageURL(url);
    }

    // Generates a random 6 character code
    const generateRandomCode = () => {
        // characters to choose from
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            // Pick a random character and append to result
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    async function handleSubmit() {
        setClubTypeError(false);
        setNameError(false);
        setDescriptionError(false);
        setImageError(false);

        let errorExists = false;

        if (!selectedType) {
            setClubTypeError(true);
            errorExists = true;
        }
        if (!clubName) {
            setNameError(true);
            errorExists = true;
        }
        if (!clubDescription) {
            setDescriptionError(true);
            errorExists = true;
        }
        if (!imageURL) {
            setImageError(true);
            errorExists = true;
        }
        if (errorExists) {
            return;
        }

        setLoading(true);

        let newCode = generateRandomCode(); 

        // Get list of existing club codes to make sure there are no duplicates
        const db = getFirestore(app);
        const clubRef = collection(db, "clubs");
        const querySnapshot = await getDocs(clubRef);
        const existingCodes = [];
        querySnapshot.forEach((doc) => {
            existingCodes.push(doc.id);
        })
        // Creates a new code if it already exists in the database for another club
        while (existingCodes.includes(newCode)) {
            newCode = generateRandomCode();
        }
        // Create the new club document in the database once it finds a unique code
        await setDoc(doc(db, "clubs", newCode), {
            id: newCode,
            name: clubName,
            description: clubDescription,
            members: [],
            school: userData.schoolID,
            type: selectedType,
            leaders: [userData.id],
            imageURL: imageURL,
        })
        // Add the new club to the requests for the school the student is in
        await updateDoc(doc(db, "schools", userData.schoolID), {
            clubRequests: arrayUnion(newCode)
        })
        // Add the club to the user's list of clubs they have requested
        await updateDoc(doc(db, "users", userData.id), {
            clubsRequested: arrayUnion(newCode)
        })

        // Navigate back to the clubs screen with a param indicating a club was requested
        // This will allow for there to be a message shown on that screen saying that the club request was sent
        router.navigate({
            pathname: "(student)/clubs",
            params: { clubRequested: "true" }
        });
    }

    return (
        <SafeAreaView className="bg-white flex-1 px-6 justify-center"> 
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                showsVerticalScrollIndicator={false}
            >
                <KeyboardAvoidingView className="flex-1 justify-center" behavior="padding">
                    {/* Back button */}
                    <TouchableOpacity 
                        className="absolute top-2 flex-row justify-center items-center gap-1"
                        activeOpacity={0.7}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={18} color={"black"} />
                        <Text className="font-bold">Back</Text>
                    </TouchableOpacity>

                    <Text className="font-bold text-3xl text-green-500 text-center">Request a New Club</Text>

                    <Text className="font-bold text-lg mt-8 mb-1 text-center">Select Club Type</Text>
                    {clubTypeError && <Text className="text-center font-bold text-red-500 mb-1">Must select club type</Text>}
                    <View className="flex-row gap-6 mb-8">
                        <Selector title="Public" selected={selectedType} setSelected={setSelectedType} description="Anyone can join and view club details" />
                        <Selector title="Private" selected={selectedType} setSelected={setSelectedType} description="Students will need a code to join"  />
                    </View>
                    

                    {nameError && <Text className="text-center font-bold text-red-500 mb-1">Name required</Text>}
                    <LoginInput text="Club Name" onChangeText={setClubName} />

                    {descriptionError && <Text className="text-center font-bold text-red-500 mb-1">Description required</Text>}
                    <LoginInput text="Club Description" multiline={true} onChangeText={setClubDescription} />

                    {imageError && <Text className="text-center font-bold text-red-500 mb-1">Image required</Text>}
                    {imageURL ? 
                        <View className="mb-6">
                            <Image 
                                source={{ uri: imageURL }}
                                style={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: 12,
                                    backgroundColor: "#eee",
                                    alignSelf: "center",
                                }}
                            />
                            <TouchableOpacity 
                                className="justify-center items-center mt-2 mx-auto bg-green-500 px-3 py-2 rounded-xl" 
                                activeOpacity={0.7}
                                onPress={changePicture}
                            >
                                <Text className="text-white font-bold text-sm">Change club image</Text>
                            </TouchableOpacity>
                        </View> :
                        <TouchableOpacity 
                            className="justify-center items-center mb-6 mx-auto bg-green-500 px-3 py-2 rounded-xl" 
                            activeOpacity={0.7}
                            onPress={changePicture}
                        >
                            <Text className="text-white font-bold text-sm">Add club image</Text>
                        </TouchableOpacity>
                    }

                    <TouchableOpacity 
                        className="bg-green-500 justify-center items-center py-3 rounded-2xl"
                        activeOpacity={0.7}
                        onPress={handleSubmit}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text className="font-bold text-lg text-white">Request Club</Text>}
                    </TouchableOpacity>

                    
                </KeyboardAvoidingView>
            </ScrollView>
            
        </SafeAreaView>
    )
}
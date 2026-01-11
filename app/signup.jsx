import { LoginInput } from "@/components/LoginInput";
import { Selector } from "@/components/Selector";
import { app, auth } from "@/firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

export default function Signup() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageURL, setimageURL] = useState();

    // Error states that show up if the user input is invalid
    const [roleError, setRoleError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmError, setConfirmError] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Special checks for ensuring that the password is strong enough 
    // (at least 8 characters, contains uppercase, lowercase, number, and special character)
    const specialChars = /[`!@#$%^&*]/;
    const lowercase = /[a-z]/;
    const uppercase = /[A-Z]/;
    // \d metacharacter matches any digit (0-9)
    const numbers = /\d/;

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
        setimageURL(url);
    }

    function createAccount() {
        // Reset all the error states before checking user input
        setRoleError(false);
        setEmailError(false);
        setNameError(false);
        setPasswordError(false);
        setConfirmError(false);
        setImageError(false);

        // If this becomes true, then there is an error and the function will return early
        let errorExists = false;

        // Check all parts of the form to make sure the user input is valid
        if(!selectedRole) {
            setRoleError(true);
            errorExists = true;
        }
        if (!imageURL) {
            setImageError(true);
            errorExists = true;
        }
        if(!email.includes("@") || !email.includes(".")) {
            setEmailError(true);
            errorExists = true;
        }
        if(!firstName || !lastName) {
            setNameError(true);
            errorExists = true;
        }
        if(!lowercase.test(password) || !uppercase.test(password) || !specialChars.test(password) || !numbers.test(password) || password.length < 8) {
            setPasswordError(true);
            errorExists = true;
        }
        if(!password == confirmPassword) {
            setConfirmError(true);
            errorExists = true;
        }

        // If there is an error, return early and do not create the account
        // By setting error states to be true, those error messages will then show on the screen
        if(errorExists) { 
            return; 
        }

        // If user has correctly filled out all fields, then create their account and add it to the database
        setLoading(true);
        const db = getFirestore(app);
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // If it gets here, then the account was created successfully
                // Now add the user to the Firestore database
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    id: user.uid,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: selectedRole,
                    createdAt: new Date(),
                    imageURL: imageURL,
                })
                
                // After successfully signing up and adding to the database, navigate to the protected area
                router.replace("(protected)");
            })
            .catch((error) => {
                // Handle errors here if account creation fails
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
            })
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 justify-center bg-white">
                {/* KeyboardAvoidingView is used instead of regular View to prevent the keyboard from covering inputs when it pops up */}
                <KeyboardAvoidingView behavior="padding">
                    <ScrollView className="px-8" showsVerticalScrollIndicator={false}>
                        <Text className="text-4xl font-bold text-center text-green-500 mb-8">Create your account</Text>
                        
                        <Text className="text-center font-bold text-xl mb-2">Choose your role</Text>
                        {/* If createAccount() finds an error, then display that to the user (different error for each field) */}
                        {roleError && <Text className="text-center font-bold text-red-500 mb-1">Must select a role</Text>}

                        {/* Flexbox to display it side by side */}
                        <View className="flex flex-row justify-center items-center gap-2 mb-6">  
                            <Selector title="Student" selected={selectedRole} setSelected={setSelectedRole} />
                            <Selector title="Administrator" selected={selectedRole} setSelected={setSelectedRole} />
                        </View>

                        {imageError && <Text className="text-center font-bold text-red-500 mb-1">Image required</Text>}
                        {imageURL ? 
                            <View className="mb-6">
                                <Image 
                                    source={{ uri: imageURL }}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 48,
                                        backgroundColor: "#eee",
                                        alignSelf: "center",
                                    }}
                                />
                                <TouchableOpacity 
                                    className="justify-center items-center mt-2 mx-auto bg-green-500 px-3 py-2 rounded-xl" 
                                    activeOpacity={0.7}
                                    onPress={changePicture}
                                >
                                    <Text className="text-white font-bold text-sm">Change profile picture</Text>
                                </TouchableOpacity>
                            </View> :
                            <TouchableOpacity 
                                className="justify-center items-center mb-6 mx-auto bg-green-500 px-3 py-2 rounded-xl" 
                                activeOpacity={0.7}
                                onPress={changePicture}
                            >
                                <Text className="text-white font-bold text-sm">Add profile picture</Text>
                            </TouchableOpacity>
                        }
                        
                        {emailError && <Text className="text-center font-bold text-red-500 mb-1">Must provide a valid email</Text>}
                        <LoginInput text="Email" onChangeText={setEmail} autoCapitalize="none" inputMode="email" />

                        {nameError && <Text className="text-center font-bold text-red-500 mb-1">Must provide first and last name</Text>}
                        <View className="flex flex-row justify-center items-center gap-2">
                            <View className="flex-1">
                                <LoginInput text="First Name" label="First Name" onChangeText={setFirstName} />
                            </View>
                            <View className="flex-1">
                                <LoginInput text="Last Name" label="Last Name" onChangeText={setLastName} />
                            </View>
                        </View>
                        
                        {passwordError && 
                            <Text className="text-center font-bold text-red-500 mb-1 text-xs leading-tight">
                                Password must be at least 8 characters, contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
                            </Text>
                        }
                        <View className="relative w-full">
                            <LoginInput text="Password" onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
                            {/* Eye icon to show/hide password */}
                            <TouchableOpacity 
                                className="absolute inset-y-0 right-3 z-10 items-center justify-center" 
                                onPress={() => setShowPassword(!showPassword)}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons 
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color={"#aaa"}
                                />
                            </TouchableOpacity>
                            
                        </View>
                        

                        {confirmError && <Text className="text-center font-bold text-red-500 mb-1">Passwords must match</Text>}
                        <View>
                            <LoginInput text="Password" label="Confirm Password" onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} autoCapitalize="none" />
                            <TouchableOpacity 
                                className="absolute inset-y-0 right-3 z-10 items-center justify-center" 
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons 
                                    name={showConfirmPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color={"#aaa"}
                                />
                            </TouchableOpacity>
                        </View>
                        

                        <TouchableOpacity 
                            className="bg-green-500 justify-center items-center py-3 rounded-2xl"
                            activeOpacity={0.7}
                            onPress={createAccount}
                        >
                            {loading ? <ActivityIndicator size="small" color="white" /> : <Text className="font-bold text-lg text-white">Create account</Text>}
                        </TouchableOpacity>

                        <Text className="text-center font-bold text-2xl my-3">or</Text>

                        <TouchableOpacity 
                            className="bg-black justify-center items-center py-3 rounded-2xl"
                            activeOpacity={0.7}
                            onPress={() => router.back()}
                        >
                            <Text className="font-bold text-lg text-white">Login to your account</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}
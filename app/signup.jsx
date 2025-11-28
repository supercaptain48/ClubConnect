import { LoginInput } from "@/components/LoginInput";
import { app, auth } from "@/firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const RoleSelector = ({ role, selectedRole, setSelectedRole }) => {
    return (
        <TouchableOpacity 
            className={`border-2 rounded-xl flex-1 py-6 ${selectedRole != role ? "border-gray-300" : ""}`}
            onPress={() => setSelectedRole(role)}
            activeOpacity={1}
        >
            <Text className="text-center font-bold">{role}</Text>
        </TouchableOpacity>
    )
}

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

    const [roleError, setRoleError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmError, setConfirmError] = useState(false);

    const specialChars = /[`!@#$%^&*]/;
    const lowercase = /[a-z]/;
    const uppercase = /[A-Z]/;
    // \d metacharacter matches any digit (0-9)
    const numbers = /\d/;

    function createAccount() {
        setRoleError(false);
        setEmailError(false);
        setNameError(false);
        setPasswordError(false);
        setConfirmError(false);

        let errorExists = false;

        if(!selectedRole) {
            setRoleError(true);
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

        if(errorExists) { 
            return; 
        }

        // If user has correctly filled out all fields, then create their account and add it to the database
        setLoading(true);
        const db = getFirestore(app);
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed up
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    id: user.uid,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: selectedRole,
                    createdAt: new Date()
                })
                
                if (selectedRole == "Administrator") {
                    router.replace("/adminSetup");
                }
                else {
                    router.replace("/studentSetup")
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
            })
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 justify-center bg-white">
                <KeyboardAvoidingView behavior="padding">
                    <ScrollView className="px-8" showsVerticalScrollIndicator={false}>
                        <Text className="text-4xl font-bold text-center text-green-600 mb-8">Create your account</Text>

                        <Text className="text-center font-bold text-xl mb-2">Choose your role</Text>
                        {roleError && <Text className="text-center font-bold text-red-500 mb-1">Must select a role</Text>}

                        <View className="flex flex-row justify-center items-center gap-2 mb-6">  
                            <RoleSelector role="Student" selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
                            <RoleSelector role="Administrator" selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
                        </View>
                        
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
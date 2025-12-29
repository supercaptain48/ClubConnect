import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { Text, View } from "react-native";

export default function AdminCreateClubScreen() {
    const navigation = useNavigation();

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

    return (
        <View>
            <Text>admin create club screen</Text>
        </View>
    )
}
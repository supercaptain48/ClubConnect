import { View, Text } from "react-native";
import { Image } from "expo-image";

export const RenderMember = ({ member, isLeader }) => {
    return (
        <View className="flex-row mb-4 items-center justify-center">
            <Image 
                source={member.imageURL ? { uri: member.imageURL } : { uri: 'https://blocks.astratic.com/img/general-img-landscape.png' }}
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 48,
                    backgroundColor: "#eee",
                    alignSelf: "center",
                }}
            />
            <View className="flex-1 ml-4">
                <Text className="font-bold text-xl">{member.firstName + " " + member.lastName}</Text>
                <Text className="text-gray-500">{member.email}</Text>
                {isLeader ? <Text className="text-green-500 font-bold">Leader</Text> : null}
            </View>
        </View>
    )
}
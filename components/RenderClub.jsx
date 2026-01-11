import { TouchableOpacity, Image, View, Text } from "react-native"

export const RenderClub = ({ club, onPress }) => {
    return (
        <TouchableOpacity 
            className="w-80 justify-center items-center px-4 py-2 border-gray-200 mb-2 flex-row" 
            activeOpacity={0.7}
            onPress={onPress}
        >
            <Image 
                source={club.imageURL ? { uri: club.imageURL } : { uri: 'https://blocks.astratic.com/img/general-img-landscape.png' }}
                style={{
                    width: 75,
                    height: 75,
                    borderRadius: 6,
                    backgroundColor: "#eee",
                    alignSelf: "center",
                }}
            />
            <View className="flex-1 ml-4">
                <Text className="text-xl font-bold">{club.name}</Text>
                <Text className="text-gray-500">{club.members.length} members</Text>
            </View>
        </TouchableOpacity>
    )
    
}
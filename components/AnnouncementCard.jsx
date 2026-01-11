import { View, Text, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const timeAgo = (timestamp) => {
    if (!timestamp) return "Just now";

    const date = timestamp instanceof Date
        ? timestamp
        : (typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp));

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(days / 365);
    return `${years}y ago`;
};


export const AnnouncementCard = ({ a }) => {
    return (
        <View className="w-52 px-4 h-52 py-2 border border-gray-200 rounded-lg">
            <Text className="text-sm font-semibold mb-1 text-green-500">{a.clubName}</Text>
            <Text className="text-lg font-bold">{a.title}</Text>
            <Text className="text-gray-600 text-xs mb-4">{timeAgo(a.createdAt)}</Text>
            <Text className="flex-1">{a.message}</Text>
        </View>
    )
}

export const AnnouncementModal = ({ announcement, modalVisible, setModalVisible }) => {
    return (
        <Modal
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(!modalVisible)}
        >
            <SafeAreaView className="flex-1 bg-white px-7">
                <Text className="text-lg font-semibold mb-1 text-green-500">{announcement.clubName}</Text>
                <Text className="text-2xl font-bold">{announcement.title}</Text>
                <Text className="text-gray-600 text-sm mb-4">{timeAgo(announcement.createdAt)}</Text>
                <Text className="flex-1">{announcement.message}</Text>
            </SafeAreaView>
        </Modal>
    )
}
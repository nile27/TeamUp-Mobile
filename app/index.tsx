import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/features/auth/use-session";
import { COLORS } from "@/config/theme";

export default function Index() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={COLORS.amber} />
      </View>
    );
  }

  return <Redirect href={session ? "/(app)/recruit" : "/(auth)/login"} />;
}

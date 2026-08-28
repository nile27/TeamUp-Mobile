import { useMemo, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";
import { useCommunityList } from "@/features/community/queries";
import { COMMUNITY_TAG_FILTERS, COMMUNITY_TAG_LABEL } from "@/config/labels";
import { COLORS } from "@/config/theme";
import type { CommunityPost, CommunityTag } from "@/features/community/types";

export default function CommunityListScreen() {
  const [tagFilter, setTagFilter] = useState<CommunityTag | "ALL">("ALL");
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunityList(tagFilter === "ALL" ? undefined : tagFilter);

  // 페이지당 10개씩 오는 응답들(pages)을 하나의 목록으로 펼침 — 새 페이지를
  // 불러올 때마다 이어붙여서 무한 스크롤처럼 동작.
  const posts = useMemo(() => data?.pages.flatMap((page) => page.posts) ?? [], [data]);

  // isRefetching을 그대로 쓰면 좋아요/삭제 등으로 인한 백그라운드 재조회에도
  // pull-to-refresh 스피너가 저절로 떠서, 실제로 당겼을 때만 켜지는 상태로 분리.
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row flex-wrap gap-2 border-b border-gray-100 px-4 py-3">
        {COMMUNITY_TAG_FILTERS.map((filter) => {
          const active = tagFilter === filter.value;
          return (
            <Pressable
              key={filter.value}
              onPress={() => setTagFilter(filter.value)}
              className={`rounded-full border px-3 py-1.5 ${
                active ? "border-amber bg-amber-soft" : "border-gray-300"
              }`}
            >
              <Text className={active ? "text-ink" : "text-ink-soft"}>{filter.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          {[1, 2, 3].map((i) => (
            <View key={i} className="h-20 w-full rounded-xl bg-gray-100" />
          ))}
        </View>
      )}

      {isError && !isLoading && (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-ink-soft">글 목록을 불러오지 못했어요.</Text>
          <Button onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2 shadow-none">
            <Text className="font-semibold text-ink">다시 시도</Text>
          </Button>
        </View>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <View className="flex-1 items-center justify-center gap-2 px-6">
          <Text className="text-ink-soft">아직 조건에 맞는 글이 없어요.</Text>
        </View>
      )}

      {!isLoading && !isError && posts.length > 0 && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-4 p-4"
          refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleManualRefresh} />}
          renderItem={({ item }) => <CommunityCard post={item} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator color={COLORS.amber} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

function CommunityCard({ post }: { post: CommunityPost }) {
  return (
    <Pressable onPress={() => router.push(`/(app)/community/${post.id}`)}>
      <Card className="flex-row gap-3 rounded-2xl border-0 bg-gray-50 p-5 shadow-none">
        <Avatar name={post.author.nickname} />
        <View className="flex-1 gap-2">
          <View className="self-start rounded-md bg-amber-soft px-2 py-1">
            <Text className="text-xs font-semibold text-amber-deep">
              {COMMUNITY_TAG_LABEL[post.tag]}
            </Text>
          </View>
          <Text className="text-base font-semibold text-ink" numberOfLines={1}>
            {post.title}
          </Text>
          <Text className="text-sm text-ink-soft" numberOfLines={2}>
            {post.content}
          </Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-xs text-ink-soft">{post.author.nickname}</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="heart" size={12} color={COLORS.amberDeep} />
              <Text className="text-xs text-ink-soft">{post._count.likes}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="chatbubble-outline" size={12} color={COLORS.inkSoft} />
              <Text className="text-xs text-ink-soft">{post._count.comments}</Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

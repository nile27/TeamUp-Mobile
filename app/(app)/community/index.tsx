import { useState } from "react";
import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useCommunityList } from "@/features/community/queries";
import { COMMUNITY_TAG_FILTERS, COMMUNITY_TAG_LABEL } from "@/config/labels";
import type { CommunityPost, CommunityTag } from "@/features/community/types";

export default function CommunityListScreen() {
  const [tagFilter, setTagFilter] = useState<CommunityTag | "ALL">("ALL");
  const { data, isLoading, isError, refetch, isRefetching } = useCommunityList(
    tagFilter === "ALL" ? undefined : tagFilter
  );

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
          <Pressable onPress={() => refetch()} className="rounded-lg bg-amber px-4 py-2">
            <Text className="font-semibold text-ink">다시 시도</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && data && data.posts.length === 0 && (
        <View className="flex-1 items-center justify-center gap-2 px-6">
          <Text className="text-ink-soft">아직 조건에 맞는 글이 없어요.</Text>
        </View>
      )}

      {!isLoading && !isError && data && data.posts.length > 0 && (
        <FlatList
          data={data.posts}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-4"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          renderItem={({ item }) => <CommunityCard post={item} />}
        />
      )}
    </View>
  );
}

function CommunityCard({ post }: { post: CommunityPost }) {
  return (
    <Pressable
      onPress={() => router.push(`/(app)/community/${post.id}`)}
      className="rounded-xl border border-gray-100 p-4"
    >
      <Text className="mb-1 text-xs font-medium text-amber-deep">{COMMUNITY_TAG_LABEL[post.tag]}</Text>
      <Text className="mb-1 text-base font-semibold text-ink" numberOfLines={1}>
        {post.title}
      </Text>
      <Text className="mb-2 text-sm text-ink-soft" numberOfLines={2}>
        {post.content}
      </Text>
      <View className="flex-row gap-3">
        <Text className="text-xs text-ink-soft">{post.author.nickname}</Text>
        <Text className="text-xs text-ink-soft">❤️ {post._count.likes}</Text>
        <Text className="text-xs text-ink-soft">댓글 {post._count.comments}</Text>
      </View>
    </Pressable>
  );
}

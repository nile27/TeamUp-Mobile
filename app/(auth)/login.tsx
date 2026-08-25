import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { loginSchema, type LoginInput } from "@/schema/auth";
import { loginWithPassword } from "@/features/auth/api";
import { API_BASE_URL } from "@/config/env";

export default function LoginScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await loginWithPassword(values.email, values.password);
      router.replace("/(app)/recruit");
    } catch (error) {
      setServerError(
        error instanceof Error ? "이메일 또는 비밀번호가 일치하지 않습니다." : "로그인 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-2 text-2xl font-bold text-ink">로그인</Text>

        <Pressable onPress={() => Linking.openURL(API_BASE_URL)} className="mb-6">
          <Text className="text-sm text-ink-soft underline">TeamUp이 궁금하다면? 서비스 소개 보기</Text>
        </Pressable>

        <Text className="mb-1 text-sm text-ink">이메일</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="mb-1 rounded-lg border border-gray-300 px-4 py-3 text-ink"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(text) => {
                setServerError(null);
                onChange(text);
              }}
              onBlur={onBlur}
              value={value ?? ""}
            />
          )}
        />
        {errors.email && <Text className="mb-3 text-sm text-red-500">{errors.email.message}</Text>}
        {!errors.email && <View className="mb-3" />}

        <Text className="mb-1 text-sm text-ink">비밀번호</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="mb-1 rounded-lg border border-gray-300 px-4 py-3 text-ink"
              placeholder="********"
              secureTextEntry
              onChangeText={(text) => {
                setServerError(null);
                onChange(text);
              }}
              onBlur={onBlur}
              value={value ?? ""}
            />
          )}
        />
        {errors.password && <Text className="mb-3 text-sm text-red-500">{errors.password.message}</Text>}
        {!errors.password && <View className="mb-3" />}

        {serverError && <Text className="mb-3 text-sm text-red-500">{serverError}</Text>}

        <Pressable
          className="mb-4 items-center rounded-lg bg-amber py-3 disabled:opacity-50"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="font-semibold text-ink">{isSubmitting ? "로그인 중..." : "로그인"}</Text>
        </Pressable>

        <Link href="/(auth)/signup" className="mb-6 text-center text-sm text-ink-soft">
          아직 계정이 없으신가요? 회원가입
        </Link>

        <Pressable onPress={() => router.replace("/(app)/recruit")}>
          <Text className="text-center text-sm text-ink-soft underline">로그인 없이 둘러보기</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

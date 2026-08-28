import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Linking, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/schema/auth";
import { loginWithPassword } from "@/features/auth/api";
import { API_BASE_URL } from "@/config/env";
import { COLORS } from "@/config/theme";

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
    defaultValues: { email: "", password: "" },
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
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: COLORS.canvas }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}
      keyboardShouldPersistTaps="handled"
      mode="layout"
      bottomOffset={16}
    >
        <View className="mb-10 gap-2">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-amber" />
            <Text className="text-3xl font-extrabold tracking-tight text-ink">로그인</Text>
          </View>
          <Pressable onPress={() => Linking.openURL(API_BASE_URL)} className="self-start">
            <Text className="text-sm text-ink-soft underline">TeamUp이 궁금하다면? 서비스 소개 보기</Text>
          </Pressable>
        </View>

        <View className="gap-5 rounded-2xl bg-gray-50 p-5">
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-ink">이메일</Text>
            <View className="relative justify-center">
              <Ionicons
                name="mail-outline"
                size={18}
                color={COLORS.inkSoft}
                style={{ position: "absolute", left: 12, zIndex: 1 }}
              />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    className="rounded-lg border-0 bg-white py-3 pl-10 pr-4 text-ink shadow-sm shadow-black/5"
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
            </View>
            {errors.email && <Text className="text-sm text-red-500">{errors.email.message}</Text>}
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-ink">비밀번호</Text>
            <View className="relative justify-center">
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.inkSoft}
                style={{ position: "absolute", left: 12, zIndex: 1 }}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    className="rounded-lg border-0 bg-white py-3 pl-10 pr-4 text-ink shadow-sm shadow-black/5"
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
            </View>
            {errors.password && <Text className="text-sm text-red-500">{errors.password.message}</Text>}
          </View>

          {serverError && <Text className="text-sm text-red-500">{serverError}</Text>}

          <Button
            className="items-center rounded-lg bg-amber py-3 shadow-none disabled:opacity-50"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text className="font-semibold text-ink">{isSubmitting ? "로그인 중..." : "로그인"}</Text>
          </Button>
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-1.5">
          <Text className="text-sm text-ink-soft">아직 계정이 없으신가요?</Text>
          <Link href="/(auth)/signup">
            <Text className="text-sm font-semibold text-amber-deep underline">회원가입</Text>
          </Link>
        </View>

        <Pressable onPress={() => router.replace("/(app)/recruit")} className="mt-8 self-center">
          <Text className="text-sm text-ink-soft underline">로그인 없이 둘러보기</Text>
        </Pressable>
    </KeyboardAwareScrollView>
  );
}

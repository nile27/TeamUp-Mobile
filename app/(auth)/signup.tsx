import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { COLORS } from "@/config/theme";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema, type SignupInput } from "@/schema/auth";
import { signupWithPassword } from "@/features/auth/api";

export default function SignupScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "", nickname: "" },
  });

  const onSubmit = async (values: SignupInput) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signupWithPassword(
        values.email,
        values.password,
        values.nickname
      );
      if (needsEmailConfirmation) {
        setServerError("가입 확인 이메일을 보냈어요. 인증 후 로그인해주세요.");
        router.replace("/(auth)/login");
        return;
      }
      router.replace("/(app)/recruit");
    } catch (error) {
      setServerError(
        error instanceof Error && error.message.includes("already registered")
          ? "이미 가입된 이메일입니다."
          : "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: COLORS.canvasSoft }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}
      keyboardShouldPersistTaps="handled"
      mode="layout"
      bottomOffset={16}
    >
        <Text className="mb-8 text-3xl font-extrabold tracking-tight text-ink">회원가입</Text>

        <Text className="mb-1 text-sm text-ink">닉네임</Text>
        <Controller
          control={control}
          name="nickname"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              className="mb-1 h-12 rounded-lg border border-gray-200 bg-white px-4 py-3 text-ink"
              placeholder="2~20자"
              onChangeText={(text) => {
                setServerError(null);
                onChange(text);
              }}
              onBlur={onBlur}
              value={value ?? ""}
            />
          )}
        />
        {errors.nickname && <Text className="mb-3 text-sm text-red-500">{errors.nickname.message}</Text>}
        {!errors.nickname && <View className="mb-3" />}

        <Text className="mb-1 text-sm text-ink">이메일</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              className="mb-1 h-12 rounded-lg border border-gray-200 bg-white px-4 py-3 text-ink"
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
            <Input
              className="mb-1 h-12 rounded-lg border border-gray-200 bg-white px-4 py-3 text-ink"
              placeholder="영문+숫자+특수문자 8자 이상"
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

        <Button
          className="mb-4 items-center rounded-lg bg-amber py-3 shadow-none disabled:opacity-50"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="font-semibold text-ink">{isSubmitting ? "가입 중..." : "회원가입"}</Text>
        </Button>

        <View className="flex-row items-center justify-center gap-1.5">
          <Text className="text-sm text-ink-soft">이미 계정이 있으신가요?</Text>
          <Link href="/(auth)/login">
            <Text className="text-sm font-semibold text-amber-deep underline">로그인</Text>
          </Link>
        </View>
    </KeyboardAwareScrollView>
  );
}

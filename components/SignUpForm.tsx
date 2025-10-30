"use client";

import Link from "next/link";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  EyeOff,
  Eye,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", passwordConfirmation: "" },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (error: unknown) {
      const message =
        (typeof error === "object" &&
          error &&
          "errors" in error &&
          (error as any).errors?.[0]?.message) ||
        (error instanceof Error
          ? error.message
          : "Signup failed. Please try again.");
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setVerificationError("Verification could not be completed.");
      }
    } catch (error: unknown) {
      const message =
        (typeof error === "object" &&
          error &&
          "errors" in error &&
          (error as any).errors?.[0]?.message) ||
        (error instanceof Error
          ? error.message
          : "Verification failed. Please try again.");
      setVerificationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="card w-full max-w-md mx-auto border border-default-200 bg-default-50 shadow-xl p-6">
        <h1 className="text-2xl font-bold text-default-900 text-center mb-2">
          Verify Your Email
        </h1>
        <p className="text-default-500 text-center mb-4">
          Enter the code sent to your email.
        </p>
        {verificationError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> {verificationError}
          </div>
        )}
        <form onSubmit={handleVerificationSubmit} className="space-y-4">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="6-digit code"
            className="input input-bordered w-full"
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>
        <p className="text-center text-sm text-default-500 mt-4">
          Didn't receive a code?{" "}
          <button
            className="text-primary hover:underline"
            onClick={async () => {
              if (signUp)
                await signUp.prepareEmailAddressVerification({
                  strategy: "email_code",
                });
            }}
          >
            Resend
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-md mx-auto border border-default-200 bg-default-50 shadow-xl p-6">
      <h1 className="text-2xl font-bold text-default-900 text-center mb-2">
        Unlock Your Account
      </h1>
      <p className="text-default-500 text-center mb-4">
        Sign up today and take control of your photos.
      </p>
      {authError && (
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {authError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-default-900">Email</span>
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="your.email@example.com"
              className="input input-bordered w-full"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-danger text-sm">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-default-900">Password</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input input-bordered w-full pr-10"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-default-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            {errors.password && (
              <span className="text-danger text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-default-900">
              Confirm Password
            </span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input input-bordered w-full pr-10"
              {...register("passwordConfirmation")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-default-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            {errors.passwordConfirmation && (
              <span className="text-danger text-sm">
                {errors.passwordConfirmation.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-primary mt-1" />
          <p className="text-sm text-default-600">
            Creating an account means you accept our Terms of Service and
            Privacy Policy.
          </p>
        </div>

        <div id="clerk-captcha" className="my-2"></div>

        <button
          type="submit"
          className="px-6 w-full py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-default-600 mt-4">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

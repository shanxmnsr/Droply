"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import { EyeOff, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";

type SignUpFormData = z.infer<typeof signUpSchema>;

interface ClerkError {
  errors?: { message?: string }[];
}

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignUpFormData) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        redirectUrl: "/dashboard",
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (error: unknown) {
      const message =
        (typeof error === "object" &&
          error &&
          "errors" in error &&
          (error as ClerkError).errors?.[0]?.message) ||
        (error instanceof Error
          ? error.message
          : "Signup failed. Please try again.");

      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

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
        setAuthError("Verification failed. Please try again.");
      }
    } catch (error: unknown) {
      const message =
        (typeof error === "object" &&
          error &&
          "errors" in error &&
          (error as ClerkError).errors?.[0]?.message) ||
        (error instanceof Error
          ? error.message
          : "Verification failed. Please try again.");

      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="card w-full max-w-md mx-auto border border-default-200 bg-default-50 shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center text-default-900 mb-4">
          Verify your email
        </h2>
        <p className="text-default-600 text-center mb-4">
          We sent a 6-digit verification code to your email.
        </p>

        {authError && (
          <div className="bg-danger-50 text-danger-700 p-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> {authError}
          </div>
        )}

        <form onSubmit={onVerify} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your verification code"
            className="input input-bordered w-full"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-md mx-auto border border-default-200 bg-default-50 shadow-xl p-6">
      <h1 className="text-2xl font-bold text-default-900 text-center mb-2">
        Create your account
      </h1>
      <p className="text-default-500 text-center mb-4">
        Join Droply — your files, your control.
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
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered w-full"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-danger text-sm">{errors.email.message}</span>
          )}
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
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {errors.password && (
              <span className="text-danger text-sm">{errors.password.message}</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
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

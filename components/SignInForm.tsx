"use client";

import { useForm } from "react-hook-form";
import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { signInSchema } from "@/schemas/signInSchema";
import { EyeOff, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";

// Infer the type directly from your Zod schema
type SignInFormData = z.infer<typeof signInSchema>;

// Define Clerk error type
interface ClerkError {
  errors?: { message?: string }[];
}

export default function SignInForm() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: SignInFormData) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
        redirectUrl: "/dashboard",
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setAuthError("Hmm... something's off. Try signing in again!");
      }
    } catch (error: unknown) {
      const message =
        (typeof error === "object" &&
          error &&
          "errors" in error &&
          (error as ClerkError).errors?.[0]?.message) ||
        (error instanceof Error
          ? error.message
          : "Oops! Something went wrong while signing in.");

      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card w-full max-w-md mx-auto border border-default-200 bg-default-50 shadow-xl p-6">
      <h1 className="text-2xl font-bold text-default-900 text-center mb-2">
        Welcome Back!
      </h1>
      <p className="text-default-500 text-center mb-4">
        Your cloud, your files—sign in safely.
      </p>

      {authError && (
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-default-900">Email</span>
          </label>
          <input
            type="email"
            placeholder="your.email@example.com"
            className="input input-bordered w-full"
            {...register("identifier")}
          />
          {errors.identifier && (
            <span className="text-danger text-sm">
              {errors.identifier.message}
            </span>
          )}
        </div>

        {/* Password */}
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
              <span className="text-danger text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-default-600 mt-4">
        Not signed up yet?{" "}
        <Link href="/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

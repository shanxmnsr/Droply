"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password too short" }),
});

export default function SignInForm() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  // Redirect already signed-in users
  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if (!isLoaded || !signIn) return;
    setIsSubmitting(true);
    setAuthError(null);

    // Prevent sending empty fields
    if (!data.email || !data.password) {
      setAuthError("Email and password are required.");
      setIsSubmitting(false);
      return;
    }

    // Log payload for debugging
    console.log("SignIn payload being sent:", {
      identifier: data.email,
      password: data.password,
    });

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        // Force immediate redirect so dashboard shows instantly
        window.location.href = "/dashboard";
      } else if (result.status === "needs_first_factor") {
        setAuthError("Two-factor authentication required.");
      } else {
        setAuthError("Sign in failed. Please check your credentials.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError("Sign in error. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card w-full max-w-md border border-black bg-base-100 shadow-xl mx-auto">
      <div className="card-body">
        <h1 className="text-2xl font-bold text-center mb-2">Sign In</h1>
        <p className="text-center text-base-content/70 mb-4">
          Your cloud, your files - sign in safely.
        </p>

        <div className="border border-gray-300 mb-4"></div>

        {authError && (
          <div className="alert alert-error mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="form-control w-full">
            <label className="label font-bold mb-2">
              <span className="label-text">Email</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="your.email@example.com"
                {...register("email")}
                className={`input input-bordered border w-full pl-2 ${
                  errors.email ? "input-error" : ""
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-sm text-error mt-1">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-control w-full">
            <label className="label font-bold mb-2">
              <span className="label-text">Password</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`input input-bordered border w-full pl-2 pr-10 ${
                  errors.password ? "input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-sm text-error mt-1">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={`flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition $`}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Not signed up yet?{" "}
          <Link href="/sign-up" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

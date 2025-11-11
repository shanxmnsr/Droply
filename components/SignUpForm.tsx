"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded || !signUp) return;
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const devBypass = process.env.NODE_ENV === "development";

      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        ...(devBypass ? { bypassCaptcha: true } : {}),
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError("An error occurred during sign-up. Please try again.");
      }
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
    setVerificationError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setVerificationError(
          "Verification could not be completed. Please try again."
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setVerificationError(error.message);
      } else {
        setVerificationError(
          "An error occurred during verification. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verification form
  if (verifying) {
    return (
      <div className="card w-full max-w-md bg-base-100 border border-black shadow-xl mx-auto">
        <div className="card-body">
          <h1 className="flex justify-center card-title text-2xl font-bold text-center">
            Verify Your Email
          </h1>
          <p className="text-center text-gray-500 mb-4">
            Enter the code sent to your email to complete signup
          </p>

          {verificationError && (
            <div className="alert alert-error mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{verificationError}</span>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="form-control w-full">
              <label className="label font-bold mb-3">
                <span className="label-text">Verification Code</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter code"
                  className="input input-bordered border w-full pl-2 mb-3"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition ${
                isSubmitting ? "loading" : ""
              }`}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main signup form
  return (
    <div className="card w-full max-w-md border border-black bg-base-100 shadow-xl mx-auto">
      <div className="card-body">
        <h1 className="flex justify-center card-title text-2xl font-bold text-center mb-2">
          Create Your Account
        </h1>
        <p className="text-center text-gray-500 mb-4">
          Sign up to start managing your images securely.
        </p>

        {authError && (
          <div className="alert alert-error mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div className="form-control w-full">
            <label className="label font-bold mb-2">
              <span className="label-text">Email</span>
            </label>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    {...field}
                    className={`input input-bordered border w-full pl-2 ${
                      errors.email ? "input-error" : ""
                    }`}
                  />
                </div>
              )}
            />
            {errors.email && (
              <span className="text-sm text-error mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password input */}
          <div className="form-control w-full">
            <label className="label font-bold mb-2">
              <span className="label-text">Password</span>
            </label>
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    className={`input input-bordered border w-full pl-2 pr-10 ${
                      errors.password ? "input-error" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}
            />
            {errors.password && (
              <span className="text-sm text-error mt-1">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* CAPTCHA div */}
          <div id="clerk-captcha" className="my-4 flex justify-center" />

          <div className="flex items-start gap-2 mt-2">
            <CheckCircle className="h-5 w-5 text-primary mt-1" />
            <p className="text-sm text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>

          <button
            type="submit"
            className={`flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition ${
              isSubmitting ? "loading" : ""
            }`}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

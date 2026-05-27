"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),

    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // SIGN UP
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded || !signUp) return;

    setIsSubmitting(true);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      toast.success("Verification code sent!");
      setVerifying(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // VERIFY
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !signUp) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
        });

        toast.success("Welcome!");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Verification failed");
    }
  };

  if (verifying) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-6">
        <h1 className="text-xl font-semibold text-white text-center">
          Verify Email
        </h1>

        <p className="text-sm text-white/50 text-center mt-1">
          Enter 6-digit code
        </p>

        <input
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="123456"
          className="mt-5 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-center tracking-widest text-white outline-none focus:border-indigo-500/40"
        />

        <button
          onClick={handleVerificationSubmit}
          className="mt-4 w-full py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition"
        >
          Verify
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.4)] p-7 transition hover:-translate-y-2">
      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-white">
          Create Your Account
        </h1>

        <p className="text-sm text-white/50 mt-1">Start using Droply</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* EMAIL */}
        <div>
          <label className="text-sm font-semibold text-white/60">Email</label>

          <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-indigo-500/40">
            <Mail className="h-4 w-4 text-white/40" />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-sm text-white"
                />
              )}
            />
          </div>

          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <label className="text-sm font-semibold text-white/60">
            Password
          </label>

          <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-indigo-500/40">
            <Lock className="h-4 w-4 text-white/40" />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-sm text-white"
                />
              )}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/40 hover:text-white/70"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-xs text-red-400 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label className="text-sm font-semibold text-white/60">
            Confirm Password
          </label>

          <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-indigo-500/40">
            <Lock className="h-4 w-4 text-white/40" />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-sm text-white"
                />
              )}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-white/40 hover:text-white/70"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="text-xs text-red-400 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* BUTTON */}
        <div className="flex items-start gap-3 mt-3 px-1">
          <div className="mt-0.5">
            <CheckCircle className="h-5 w-5 text-indigo-400 mt-1" />
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <button
          disabled={isSubmitting}
          className="w-full mt-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold tracking-wide shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating your Droply account..." : "Create Account"}
        </button>
      </form>

      {/* FOOTER */}
      <p className="text-center text-sm text-white/50 mt-6">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-indigo-400 hover:text-indigo-300 font-bold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

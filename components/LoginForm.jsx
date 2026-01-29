"use client";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";
import { useAuth } from "@/hooks/useAuth"; // ✅ Fixed import

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login, isLoggingIn, loginError } = useAuth();

  function onSubmit(data) {
    login(data);
  }

  // Helper function to format error messages
  const getErrorMessage = (error) => {
    if (!error) return null;

    const errorMessages = {
      "Invalid login credentials": "Incorrect email or password. Please try again.",
      "Email not confirmed": "Please verify your email address first.",
      "User not found": "No account found with this email.",
      "Invalid email": "Please enter a valid email address.",
      "Too many requests": "Too many login attempts. Please try again later.",
    };

    return errorMessages[error.message] || error.message || "An error occurred. Please try again.";
  };

  return (
    <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Error Message */}
      {loginError && (
        <div
          role="alert"
          className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md"
        >
          {getErrorMessage(loginError)}
        </div>
      )}

      <div className="space-y-4 sm:space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-primarygreen-500"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isLoggingIn}
            autoComplete="email" // ✅ Added for better UX
            className="h-11 sm:h-12 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 border-none"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-primarygreen-500"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoggingIn}
            autoComplete="current-password" // ✅ Added for better UX
            className="h-11 sm:h-12 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500 border-none"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-11 sm:h-12 bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700 font-semibold tracking-wide transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <span className="flex items-center gap-2">
            <Spinner className="h-4 w-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
}
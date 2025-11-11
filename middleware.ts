import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  try {
    const { userId } = await auth();
    const url = new URL(request.url);

    // If user is logged in and tries to access public routes, redirect to dashboard
    if (userId && isPublicRoute(request) && url.pathname !== "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Protect private routes
    if (!isPublicRoute(request)) {
      await auth.protect(); // will throw if user not logged in
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
});

// Match all routes except static files and _next
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

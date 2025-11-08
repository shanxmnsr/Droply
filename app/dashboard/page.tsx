
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import Navbar from "@/components/Navbar";
import { CloudUpload } from "lucide-react";

export default async function Dashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  // Serialize user to send only necessary info to client components
  const serializedUser = user
    ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        username: user.username,
        emailAddress: user.emailAddresses?.[0]?.emailAddress,
      }
    : null;

  // Safely generate a display name
  const userName = user
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username || user.emailAddresses?.[0]?.emailAddress || "User"
    : "User";

  return (
    <div className="min-h-screen flex flex-col bg-default-50">
      <Navbar user={serializedUser} />

      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <DashboardContent 
          userId={user.id}
          userName={userName}
        />
      </main>

      <footer className="bg-default-50 border-t border-default-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CloudUpload className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Droply</h2>
            </div>
            <p className="text-default-500 text-sm">
              &copy; {new Date().getFullYear()} Droply
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

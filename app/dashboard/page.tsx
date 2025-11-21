import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import Navbar from "@/components/Navbar";
import { CloudUpload } from "lucide-react";

interface DashboardProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  // Resolve searchParams safely
  const resolvedSearchParams = searchParams ?? {};

  // Proper typing: tab can be string | undefined
  const tabParam: string | string[] | undefined = resolvedSearchParams.tab;
  const tab: string = Array.isArray(tabParam) ? tabParam[0] : tabParam ?? "files";

  // Authenticate user
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");

  const serializedUser = user
    ? {
        id: user.id,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        imageUrl: user.imageUrl ?? null,
        username: user.username ?? null,
        emailAddress: user.emailAddresses?.[0]?.emailAddress ?? null,
      }
    : null;

  const userName = user
    ? [
        user.firstName,
        user.lastName,
        user.username,
        user.emailAddresses?.[0]?.emailAddress,
      ].filter(Boolean)[0] ?? "User"
    : "User";

  return (
    <div className="min-h-screen flex flex-col bg-default-50">
      <Navbar user={serializedUser} initialTab={tab} />
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <DashboardContent userId={user?.id ?? ""} userName={userName} tab={tab} />
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

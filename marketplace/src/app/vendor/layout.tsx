import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import VendorProfile from "@/models/VendorProfile";
import VendorSidebar from "./VendorSidebar";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let storeName = "My Store";

  try {
    const session = await auth();
    if (session?.user?.id) {
      await dbConnect();
      const profile = await VendorProfile.findOne({
        userId: session.user.id,
      }).lean();
      if (profile && typeof profile === "object" && "storeName" in profile) {
        storeName = profile.storeName as string;
      }
    }
  } catch {
    // Fall back to default store name
  }

  return <VendorSidebar storeName={storeName}>{children}</VendorSidebar>;
}

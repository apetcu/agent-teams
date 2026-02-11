import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Marketplace. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">
              Contact
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

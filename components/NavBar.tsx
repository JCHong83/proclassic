"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Opportunities" },
    { href: "/profile", label: "Profile" },
    { href: "/institution", label: "Institution" },
  ];

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex gap-6">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <span
              className={`px-2 py-1 rounded-md font-medium cursor-pointer ${
                pathname === link.href ? "text-indigo-600" : "text-gray-700 hover:text-indigo-500"
              }`}
            >
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
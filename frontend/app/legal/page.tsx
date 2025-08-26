import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

export default function Legal() {
  return (
    <div className="min-h-screen mt-10">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <nav className="space-y-6">
          {[
            {
              title: "Terms of Service - Consumer",
              href: "/legal/terms-consumer",
            },
            {
              title: "Terms of Service - Enterprise",
              href: "/legal/terms-enterprise",
            },
            { title: "Privacy policy", href: "/legal/privacy" },
            { title: "Cookie policy", href: "/legal/cookie" },
            { title: "Refund policy", href: "/legal/use-policy" },
            { title: "FAQ - Consumer/Enterprise", href: "/legal/FAQ" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between py-4 text-lg sm:text-xl md:text-2xl hover:opacity-70 transition-opacity"
            >
              <span className="font-light">{item.title}</span>
              <div className="rounded-full border border-white/20 p-3">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

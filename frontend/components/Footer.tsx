import Logo from "@/public/capitalkvAILogo.png";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Linkedin, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto pt-5 bg-[#04020c] w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-2 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full md:w-auto">
              <Link href="/" className="flex gap-2 items-center mb-4 sm:mb-0">
                <Image src={Logo} alt="Logo" className="h-8 w-8" />
                <span className="font-medium text-white text-lg">
                  CapitalKV
                </span>
              </Link>
            </div>
            <nav className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center items-center flex-1 order-last md:order-none mb-4 md:mb-0">
              <Link
                className="text-white/70 hover:text-white text-xs transition"
                href="/"
              >
                Home
              </Link>
              <Link
                className="text-white/70 hover:text-white text-xs transition"
                href="/about"
              >
                About
              </Link>
              <Link
                className="text-white/70 hover:text-white text-xs transition"
                href="/shop"
              >
                Shop
              </Link>
              <Link
                className="text-white/70 hover:text-white text-xs transition"
                href="/blog"
              >
                Blog
              </Link>
              <Link
                className="text-white/70 hover:text-white text-xs transition"
                href="/legal"
              >
                Legal
              </Link>
              <Link
                className="text-white/70 hover:text-white text-xs transition"
                href="/contact"
              >
                Contact us
              </Link>
            </nav>
            <div className="flex gap-2 justify-center md:justify-end w-full md:w-auto mb-4 md:mb-0">
              <Button
                aria-label="LinkedIn"
                className="bg-gradient-to-b from-fuchsia-500 to-purple-900 border-2 border-purple-600 rounded-full p-2 transition flex items-center justify-center"
              >
                <Linkedin className="text-white" size={20} />
              </Button>
              <Button
                aria-label="Facebook"
                className="bg-purple-600 hover:bg-purple-800 rounded-full p-2 transition flex items-center justify-center"
              >
                <Facebook className="text-white" size={20} />
              </Button>
              <Button
                aria-label="Instagram"
                className="bg-purple-600 hover:bg-purple-800 rounded-full p-2 transition flex items-center justify-center"
              >
                <Instagram className="text-white" size={20} />
              </Button>
            </div>
          </div>
          <hr className="border-t border-white/20" />
          <div className="text-center py-2 text-xs text-white/70">
            © 2025 CapitalKV. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

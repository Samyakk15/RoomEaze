import React from "react";
import Container from "./Container";

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Safety", href: "/safety" },
    { label: "Cancellation", href: "/cancellation" },
    { label: "Contact Us", href: "/contact" },
  ],
  Hosting: [
    { label: "List Your Room", href: "/list-room" },
    { label: "Host Resources", href: "/host-resources" },
    { label: "Community Forum", href: "/community" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <Container>
        {/* ── Link Columns ── */}
        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-rose-500"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Copyright ── */}
        <div className="border-t border-gray-200 py-6">
          <p className="text-center text-sm text-gray-500">
            &copy; {currentYear} StayFinder. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

import { Github, Linkedin, Twitter } from "lucide-react";
import { useStateContext } from "../contexts/ContextProvider";

const Footer = () => {
  const { currentColor } = useStateContext();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className="size-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${currentColor}20, ${currentColor}40)`,
                  border: `1px solid ${currentColor}30`,
                }}
              >
                <svg
                  className="size-5"
                  style={{ color: currentColor }}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                UpKeepPro
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-xs">
              Streamline your maintenance operations with our comprehensive
              management platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Tasks
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Chat
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Settings
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="text-gray-600 dark:text-gray-400">
                <span className="block text-sm">Email:</span>
                <a
                  href="mailto:cmipg@defense.tn"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  cmipg@defense.tn
                </a>
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                <span className="block text-sm">Phone:</span>
                <a
                  href="tel:+1234567890"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                <span className="block text-sm">Address:</span>
                <span>123 Maintenance St, Suite 100</span>
                <span>Gafsa, Tunisia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {currentYear} UpKeepPro. All rights reserved.
            </p>

            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

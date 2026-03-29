"use client";

import React from "react";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95l4.915-1.353A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.333c-1.554 0-3.04-.396-4.354-1.111l-.312-.17-2.903.8.784-2.8-.194-.326A8.322 8.322 0 013.667 12c0-4.602 3.731-8.333 8.333-8.333 4.602 0 8.333 3.731 8.333 8.333 0 4.602-3.731 8.333-8.333 8.333zm4.562-6.19c-.25-.125-1.48-.73-1.708-.813-.23-.083-.396-.125-.563.125-.166.25-.646.813-.792.98-.146.166-.291.187-.541.062-.25-.125-1.056-.39-2.01-1.24-.741-.66-1.24-1.474-1.386-1.724-.146-.25-.015-.386.11-.51.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.166.041-.312-.02-.437-.063-.125-.563-1.354-.771-1.854-.203-.49-.411-.423-.563-.431-.146-.008-.312-.008-.479-.008-.166 0-.437.062-.666.312-.23.25-.875.854-.875 2.083 0 1.23.896 2.417 1.021 2.583.125.166 1.76 2.687 4.26 3.766 1.78.766 2.427.828 3.25.698.823-.13 1.48-.604 1.688-1.188.208-.583.208-1.083.146-1.188-.063-.104-.23-.166-.48-.291z"
      clipRule="evenodd"
    />
  </svg>
);

export default function FloatingWhatsApp() {
  // Using the Twilio Sandbox number +14155238886
  const whatsappUrl = "https://wa.me/14155238886?text=join%20coal-explanation";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      aria-label="Chat with Sahayak on WhatsApp"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
}

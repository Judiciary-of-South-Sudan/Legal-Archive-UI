import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-slate-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Privacy Policy</h1>
        <p className="mb-4">
          At Juba Legal Archive, we value your privacy. This Privacy Policy outlines how we collect,
          use, and protect your personal information when you access our website.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
        <p className="mb-4">
          We may collect non-personal data such as browser type, device, and usage statistics to
          improve the functionality and performance of the site.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Use of Information</h2>
        <p className="mb-4">
          Information collected is solely used for improving user experience, maintaining the
          platform, and analytics. We do not sell or share your personal data with third parties.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Cookies</h2>
        <p className="mb-4">
          We may use cookies to store user preferences and enhance navigation. You can adjust your
          browser settings to manage cookie behavior.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Your Consent</h2>
        <p className="mb-4">
          By using this website, you consent to the terms outlined in this Privacy Policy.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-slate-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Terms of Use</h1>

        <p className="mb-4">
          These Terms of Use govern your access to and use of the Juba Legal Archive website. By using
          this website, you agree to comply with and be bound by these terms.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of Content</h2>
        <p className="mb-4">
          All content provided is for informational purposes only. You may not reproduce, distribute,
          or exploit the materials without proper attribution or permission.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Accuracy of Information</h2>
        <p className="mb-4">
          While we strive to ensure legal content is accurate and up-to-date, we make no warranties
          regarding completeness or accuracy. Users are advised to consult official legal sources.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. User Conduct</h2>
        <p className="mb-4">
          Users agree not to misuse the platform, upload malicious content, or engage in activities
          that could harm the site or its users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to update these terms at any time. Continued use of the site implies
          acceptance of the current terms.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;

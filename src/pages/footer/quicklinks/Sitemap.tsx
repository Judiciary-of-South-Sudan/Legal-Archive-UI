import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Sitemap = () => {
  return (
    <div className="min-h-screen bg-background text-slate-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Sitemap</h1>
        <p className="mb-6">
          Below is a structured list of all the main sections and pages available on the Juba Legal Archive platform.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Judgments</h2>
            <ul className="list-disc list-inside">
              <li><Link to="/judgments/supreme-court" className="text-blue-700 hover:underline">Supreme Court</Link></li>
              <li><Link to="/judgments/court-of-appeal" className="text-blue-700 hover:underline">Court of Appeal</Link></li>
              <li><Link to="/judgments/high-court" className="text-blue-700 hover:underline">High Court</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Laws</h2>
            <ul className="list-disc list-inside">
              <li><Link to="/laws/constitution" className="text-blue-700 hover:underline">Constitution</Link></li>
              <li><Link to="/laws/acts" className="text-blue-700 hover:underline">Acts</Link></li>
              <li><Link to="/legal-notices" className="text-blue-700 hover:underline">Legal Notices</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Pages</h2>
            <ul className="list-disc list-inside">
              <li><Link to="/about" className="text-blue-700 hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="text-blue-700 hover:underline">Contact</Link></li>
              <li><Link to="/privacy" className="text-blue-700 hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-blue-700 hover:underline">Terms of Use</Link></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sitemap;

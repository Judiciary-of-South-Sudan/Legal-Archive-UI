import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-slate-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">About Us</h1>
        <p className="mb-4">
          The Juba Legal Archive is a centralized digital repository designed to provide open access
          to critical legal documents and resources of the Republic of South Sudan. Our platform aims
          to support legal professionals, scholars, and citizens by offering reliable, organized, and
          searchable legal materials including court judgments, legislation, and legal notices.
        </p>
        <p className="mb-4">
          We are committed to promoting transparency, access to justice, and legal awareness through
          technology. Whether you're researching case law, exploring legal frameworks, or seeking
          civic education, the Juba Legal Archive serves as a trusted source.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default About;

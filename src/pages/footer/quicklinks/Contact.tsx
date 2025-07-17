import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background text-slate-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Contact Us</h1>
        <p className="mb-6">
          We'd love to hear from you. Whether you have a question about legal resources, want to
          report an issue, or simply want to reach out—our team is here to help.
        </p>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Email</h2>
            <p>support@jubalegalarchive.org</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Address</h2>
            <p>
              Juba Legal Archive Office<br />
              Ministries Road, Juba<br />
              Central Equatoria, South Sudan
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

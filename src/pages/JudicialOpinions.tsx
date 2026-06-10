import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const JudicialOpinions = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      <Construction className="mb-6 h-14 w-14 text-muted-foreground" />
      <h1 className="text-2xl font-bold text-foreground">Judicial Opinions</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        This section is under development. Official advisory opinions and legal interpretations will be published here once sourced and verified.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link to="/">Return to Home</Link>
      </Button>
    </main>
    <Footer />
  </div>
);

export default JudicialOpinions;

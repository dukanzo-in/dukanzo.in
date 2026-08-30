import { createClient } from "@/lib/supabase/server";
import { RequirementsBuilder } from "@/components/requirements/RequirementsBuilder";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Project Requirements | Dukanzo",
  description: "Tell us about your business and website requirements.",
};

export default async function RequirementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?redirect=/requirements");
  }

  // Fetch all requirement questions and options
  const { data: rawQuestions, error: qError } = await supabase
    .from("requirement_questions")
    .select("*")
    .order("display_order", { ascending: true });

  const { data: rawOptions, error: oError } = await supabase
    .from("question_options")
    .select("*")
    .order("display_order", { ascending: true });

  if (qError || oError || !rawQuestions) {
    return <div>Error loading requirements configuration.</div>;
  }

  // Map options to questions
  const questions = rawQuestions.map(q => ({
    ...q,
    options: rawOptions?.filter(o => o.question_id === q.id) || []
  }));

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <RequirementsBuilder questions={questions} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

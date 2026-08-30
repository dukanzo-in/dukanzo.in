import { createClient } from "@/lib/supabase/server";
import { ConfigurationForm } from "@/components/tiers/ConfigurationForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Configure Tier | Dukanzo",
  description: "Configure your selected Dukanzo service tier.",
};

export default async function ConfigurePage(props: {
  searchParams: Promise<{ tier?: string }>
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const tierParam = searchParams.tier ? `?tier=${searchParams.tier}` : '';
    const redirectUrl = `/configure${tierParam}`;
    redirect(`/auth?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  // Fetch all active tiers
  const { data: tiers, error: tiersError } = await supabase
    .from("service_tiers")
    .select("*")
    .eq("is_active", true)
    .order("base_price", { ascending: true });

  if (tiersError || !tiers) {
    return <div>Error loading tiers.</div>;
  }

  // Fetch all active tier options
  const { data: tierOptions, error: optionsError } = await supabase
    .from("tier_options")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (optionsError || !tierOptions) {
    return <div>Error loading options.</div>;
  }

  // Determine initial tier from search param (e.g., ?tier=standard)
  const initialTierName = searchParams.tier;
  let selectedTierId = tiers[0].id; // default to first tier (Basic)

  if (initialTierName) {
    const matchedTier = tiers.find(t => t.name.toLowerCase() === initialTierName.toLowerCase());
    if (matchedTier) {
      selectedTierId = matchedTier.id;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-muted/10 py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Configure Your Project</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Select your package and tell us exactly what you need.
            </p>
          </div>
          
          <ConfigurationForm 
            tiers={tiers} 
            tierOptions={tierOptions} 
            initialTierId={selectedTierId} 
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

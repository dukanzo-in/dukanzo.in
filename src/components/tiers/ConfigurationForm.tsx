"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface Tier {
  id: string;
  name: string;
  description: string;
  base_price: number;
}

export interface TierOption {
  id: string;
  tier_id: string;
  option_key: string;
  option_value: string;
  display_name: string;
  input_type: string;
  choices?: string[];
}

interface ConfigurationFormProps {
  tiers: Tier[];
  tierOptions: TierOption[];
  initialTierId: string;
}

export function ConfigurationForm({ tiers, tierOptions, initialTierId }: ConfigurationFormProps) {
  const router = useRouter();
  const [activeTierId, setActiveTierId] = useState(initialTierId);
  const { register, control, handleSubmit } = useForm();
  
  const activeTier = tiers.find(t => t.id === activeTierId);
  const activeOptions = tierOptions.filter(o => o.tier_id === activeTierId);

  const onSubmit = (data: Record<string, unknown>) => {
    // Collect the configuration specific to the active tier, plus custom notes
    const payload = {
      tierId: activeTierId,
      tierName: activeTier?.name,
      configuration: (data as Record<string, unknown>)[activeTierId] || {},
      customNotes: data.customNotes || ""
    };

    console.log("Saving Configuration:", payload);
    // Persist to localStorage for Phase 1 flow
    localStorage.setItem("dukanzo_configuration", JSON.stringify(payload));
    
    // Proceed to requirements
    router.push("/requirements");
  };

  const renderField = (option: TierOption) => {
    const fieldName = `${activeTierId}.${option.option_key}`;

    switch (option.input_type) {
      case 'checkbox':
        return (
          <div key={option.id} className="flex items-center space-x-3 py-3">
            <Controller
              name={fieldName}
              control={control}
              defaultValue={option.option_value === 'true'}
              render={({ field }) => (
                <Checkbox 
                  id={option.id} 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
              )}
            />
            <Label htmlFor={option.id} className="text-base font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {option.display_name}
            </Label>
          </div>
        );

      case 'select':
        const selectChoices = option.choices || [];
        return (
          <div key={option.id} className="py-3 space-y-2">
            <Label htmlFor={option.id} className="text-base font-semibold">{option.display_name}</Label>
            <Controller
              name={fieldName}
              control={control}
              defaultValue={option.option_value}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id={option.id} className="w-full max-w-sm">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectChoices.map((choice: string) => (
                      <SelectItem key={choice} value={choice}>{choice}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        );

      case 'radio':
        const radioChoices = option.choices || [];
        return (
          <div key={option.id} className="py-3 space-y-3">
            <Label className="text-base font-semibold">{option.display_name}</Label>
            <Controller
              name={fieldName}
              control={control}
              defaultValue={option.option_value}
              render={({ field }) => (
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {radioChoices.map((choice: string) => (
                    <div key={choice} className="flex items-center space-x-2">
                      <RadioGroupItem value={choice} id={`${option.id}-${choice}`} />
                      <Label htmlFor={`${option.id}-${choice}`} className="font-normal">{choice}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Tier Selection */}
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-xl font-bold mb-4">Confirm Your Plan</h2>
        <div className="inline-flex bg-muted/50 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto shadow-inner">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setActiveTierId(tier.id)}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                activeTierId === tier.id 
                  ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-105"
              }`}
            >
              {tier.name}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-2 shadow-xl rounded-2xl overflow-hidden transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/10 border-b pb-8 pt-8">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-black">{activeTier?.name} Configuration</CardTitle>
              <CardDescription className="text-base mt-2 max-w-xl">
                {activeTier?.description}
              </CardDescription>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">Starting at</div>
              <div className="text-3xl font-black text-primary">₹{activeTier?.base_price}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-10">
          <div className="space-y-2 mb-10">
            <h3 className="text-2xl font-bold tracking-tight">Customize Your Package</h3>
            <p className="text-base text-muted-foreground">Select your preferences below to tailor the project to your exact needs.</p>
          </div>

          <div className="space-y-2 divide-y">
            {activeOptions.map(renderField)}
            {activeOptions.length === 0 && (
              <div className="py-4 text-muted-foreground italic">No specific options for this tier.</div>
            )}
          </div>
          
          <div className="mt-12 space-y-3">
            <Label htmlFor="customNotes" className="text-xl font-bold tracking-tight block">
              Anything else you&apos;d like us to know?
            </Label>
            <p className="text-sm text-muted-foreground pb-2">
              Have a specific feature request or custom requirement not listed above? Describe it here.
            </p>
            <Textarea
              id="customNotes"
              placeholder="e.g., We need integration with our existing inventory system..."
              className="min-h-[120px] resize-y"
              {...register("customNotes")}
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t p-8 flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="text-lg font-medium w-full sm:w-auto text-center sm:text-left sm:hidden">
            Starting at: <span className="font-black text-2xl text-primary block">₹{activeTier?.base_price}</span>
          </div>
          <Button type="button" variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground w-full sm:w-auto" onClick={() => {/* Skip to builder */}}>
            I don&apos;t know, help me decide
          </Button>
          <Button type="submit" size="lg" className="font-bold text-lg px-10 py-6 rounded-xl w-full sm:w-auto shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            Continue to Requirements →
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

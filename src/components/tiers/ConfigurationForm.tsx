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
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-muted/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setActiveTierId(tier.id)}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTierId === tier.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tier.name}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-8">
          <CardTitle className="text-2xl">{activeTier?.name} Configuration</CardTitle>
          <CardDescription className="text-base mt-2">
            {activeTier?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-2 mb-8">
            <h3 className="text-xl font-bold tracking-tight">Included Features</h3>
            <p className="text-sm text-muted-foreground">Select your preferences below. Options vary by tier.</p>
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
        <CardFooter className="bg-muted/10 border-t border-border/50 p-6 flex flex-col gap-4">
          <div className="text-lg font-medium self-start">
            Base Price: <span className="font-bold text-xl">₹{activeTier?.base_price}</span>
          </div>
          <div className="flex w-full justify-between items-center">
            <Button type="button" variant="outline" className="text-left justify-start font-normal" onClick={() => {/* Skip to builder */}}>I don&apos;t know, help me decide</Button>
            <Button type="submit" size="lg" className="font-bold text-md px-8">
              Continue to Requirements
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, Save, CheckCircle2 } from "lucide-react";

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  display_order: number;
}

export interface RequirementQuestion {
  id: string;
  tier_id: string | null;
  question_text: string;
  question_type: string; // 'text', 'textarea', 'select', 'radio', 'checkbox', 'file'
  is_required: boolean;
  step_group: string;
  options: QuestionOption[];
}

interface RequirementsBuilderProps {
  questions: RequirementQuestion[];
}

const STEPS = [
  "Business",
  "Customers",
  "Website",
  "Design",
  "Features",
  "Content",
  "Special Requirements",
  "Review"
];

export function RequirementsBuilder({ questions }: RequirementsBuilderProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tierData, setTierData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { register, control, handleSubmit, watch, reset, getValues, formState: { errors } } = useForm();
  
  useEffect(() => {
    // Load config from Issue 5 (tier + selected features)
    const savedConfig = localStorage.getItem("dukanzo_configuration");
    if (savedConfig) {
      setTierData(JSON.parse(savedConfig));
    }
    
    // Load drafts if any
    const savedDraft = localStorage.getItem("dukanzo_srs_draft");
    if (savedDraft) {
      reset(JSON.parse(savedDraft));
    }
    setIsLoaded(true);
  }, [reset]);

  const saveDraft = () => {
    localStorage.setItem("dukanzo_srs_draft", JSON.stringify(getValues()));
  };

  const handleNext = async () => {
    // Basic validation could go here, but for now we rely on final submit or simple form HTML validation
    saveDraft();
    setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    saveDraft();
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const onSubmit = (data: any) => {
    const finalPayload = {
      ...tierData,
      requirements: data
    };
    
    // Save the final payload for Issue 7
    localStorage.setItem("dukanzo_final_payload", JSON.stringify(finalPayload));
    console.log("Proceeding to Submission Phase (Issue #7)...", finalPayload);
    
    // Placeholder alert since Issue #7 is out of scope for now
    alert("Requirements collected successfully! Next phase (Issue #7) will handle submission.");
  };

  if (!isLoaded) return <div className="text-center py-12">Loading builder...</div>;

  const currentStepName = STEPS[currentStepIndex];
  
  // Filter questions for the current step AND applicable to the selected tier
  const activeQuestions = questions.filter(q => 
    q.step_group === currentStepName && 
    (q.tier_id === null || q.tier_id === tierData?.tierId)
  );

  const renderQuestionInput = (q: RequirementQuestion) => {
    const fieldName = q.id;

    switch (q.question_type) {
      case 'text':
        return (
          <Input 
            {...register(fieldName, { required: q.is_required })} 
            placeholder="Type here..." 
            className="w-full mt-2" 
          />
        );
      case 'textarea':
        return (
          <Textarea 
            {...register(fieldName, { required: q.is_required })} 
            placeholder="Type your answer here..." 
            className="min-h-[100px] mt-2" 
          />
        );
      case 'radio':
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={{ required: q.is_required }}
            render={({ field }) => (
              <RadioGroup 
                onValueChange={field.onChange} 
                defaultValue={field.value} 
                className="mt-3 space-y-2"
              >
                {q.options.map(opt => (
                  <div key={opt.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.option_text} id={opt.id} />
                    <Label htmlFor={opt.id} className="font-normal text-base cursor-pointer">
                      {opt.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );
      case 'checkbox':
        // Checkboxes require tracking an array in react-hook-form manually or registering multiple values.
        // For simplicity with dynamic data, we can store them as objects { [opt_text]: boolean }
        return (
          <div className="mt-3 space-y-3">
            {q.options.map(opt => (
              <div key={opt.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={opt.id} 
                  {...register(`${fieldName}.${opt.id}`)}
                />
                <Label htmlFor={opt.id} className="font-normal text-base cursor-pointer">
                  {opt.option_text}
                </Label>
              </div>
            ))}
          </div>
        );
      case 'select':
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={{ required: q.is_required }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="mt-2 w-full max-w-sm">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {q.options.map(opt => (
                    <SelectItem key={opt.id} value={opt.option_text}>{opt.option_text}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );
      case 'file':
        return (
          <div className="mt-2 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg border border-dashed">
            File uploads are mocked for Phase 1. Final integration will be handled in Issue 7/8.
            <Input type="file" className="mt-2" />
          </div>
        )
      default:
        return <Input {...register(fieldName)} className="mt-2" />;
    }
  };

  const renderReviewStep = () => {
    const data = getValues();
    return (
      <div className="space-y-6">
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mb-6">
          <h3 className="font-bold text-lg mb-2">Package Selected</h3>
          <p className="text-muted-foreground">{tierData?.tierName} Tier</p>
        </div>
        
        {STEPS.filter(s => s !== 'Review').map(stepName => {
          const stepQuestions = questions.filter(q => 
            q.step_group === stepName && (q.tier_id === null || q.tier_id === tierData?.tierId)
          );
          
          if (stepQuestions.length === 0) return null;

          return (
            <div key={stepName} className="mb-6">
              <h4 className="text-lg font-bold border-b pb-2 mb-4">{stepName}</h4>
              <dl className="space-y-4">
                {stepQuestions.map(q => {
                  let answer = data[q.id];
                  // Handle checkbox array objects
                  if (q.question_type === 'checkbox' && answer) {
                    const selectedTexts = Object.keys(answer)
                      .filter(key => answer[key])
                      .map(key => q.options.find(o => o.id === key)?.option_text)
                      .filter(Boolean);
                    answer = selectedTexts.join(", ");
                  }

                  return (
                    <div key={q.id}>
                      <dt className="text-sm font-semibold text-muted-foreground mb-1">{q.question_text}</dt>
                      <dd className="text-base">{answer || <span className="italic text-muted-foreground">No answer provided</span>}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-muted-foreground">Step {currentStepIndex + 1} of {STEPS.length}</span>
          <span className="text-foreground">{currentStepName}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Mobile-friendly breadcrumbs representation */}
        <div className="hidden sm:flex flex-wrap gap-2 mt-4 text-xs text-muted-foreground">
          {STEPS.map((step, idx) => (
            <span key={step} className={`flex items-center ${idx === currentStepIndex ? 'text-primary font-bold' : idx < currentStepIndex ? 'text-foreground' : ''}`}>
              {step} {idx < STEPS.length - 1 && <ChevronRight className="w-3 h-3 mx-1 opacity-50" />}
            </span>
          ))}
        </div>
      </div>

      <Card className="border-2 shadow-sm">
        <form onSubmit={handleSubmit(currentStepIndex === STEPS.length - 1 ? onSubmit : handleNext)}>
          <CardHeader className="bg-muted/5 border-b border-border/50 pb-6">
            <CardTitle className="text-2xl">{currentStepName}</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            
            {currentStepName !== 'Review' && activeQuestions.length === 0 && (
              <div className="text-muted-foreground italic">No questions for this section.</div>
            )}

            {currentStepName !== 'Review' && activeQuestions.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label className="text-lg font-semibold block">
                  {q.question_text} {q.is_required && <span className="text-destructive">*</span>}
                </Label>
                {renderQuestionInput(q)}
                {errors[q.id] && <span className="text-sm text-destructive mt-1 block">This field is required</span>}
              </div>
            ))}

            {/* Special Requirements Field - Explicitly requested to be visible on Special Requirements step */}
            {currentStepName === 'Special Requirements' && (
              <div className="space-y-2">
                <Label className="text-lg font-semibold block">
                  Anything else you'd like us to know?
                </Label>
                <p className="text-sm text-muted-foreground pb-2">
                  Have a specific feature request or custom requirement not covered? Describe it here in detail.
                </p>
                <Textarea 
                  {...register("special_requirements")} 
                  placeholder="e.g., I need a booking calendar that syncs with Google Calendar..." 
                  className="min-h-[150px]"
                />
              </div>
            )}

            {currentStepName === 'Review' && renderReviewStep()}

          </CardContent>
          
          <CardFooter className="bg-muted/5 border-t border-border/50 p-6 flex justify-between items-center">
            {currentStepIndex > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="font-bold">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div></div> // Empty div for flex spacing
            )}
            
            {currentStepIndex < STEPS.length - 1 ? (
              <Button type="submit" className="font-bold px-6">
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" size="lg" className="font-bold px-8">
                Submit Request <CheckCircle2 className="w-5 h-5 ml-2" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
      
      {/* Draft Status Indicator */}
      <div className="flex justify-center items-center text-xs text-muted-foreground space-x-1 opacity-70">
        <Save className="w-3 h-3" />
        <span>Draft saved automatically</span>
      </div>
    </div>
  );
}

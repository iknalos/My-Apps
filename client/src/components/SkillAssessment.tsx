import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Question {
  id: string;
  text: string;
}

interface CategoryRatings {
  singlesRating: number | null;
  mensDoublesRating: number | null;
  womensDoublesRating: number | null;
  mixedDoublesRating: number | null;
}

interface SkillAssessmentProps {
  gender: string;
  onComplete: (ratings: CategoryRatings) => void;
  onBack?: () => void;
}

const ratingOptions = [
  { value: "1", label: "1 - Beginner", points: 1 },
  { value: "2", label: "2 - Developing", points: 2 },
  { value: "3", label: "3 - Intermediate", points: 3 },
  { value: "4", label: "4 - Advanced", points: 4 },
  { value: "5", label: "5 - Expert", points: 5 },
];

const singlesQuestions: Question[] = [
  { id: "singles_1", text: "Overall singles playing experience and match exposure" },
  { id: "singles_2", text: "Cardiovascular stamina during long rallies (21+ shots)" },
  { id: "singles_3", text: "Footwork speed and court coverage" },
  { id: "singles_4", text: "Consistency in returning clears to the baseline" },
  { id: "singles_5", text: "Consistency in executing drop shots from the back court" },
  { id: "singles_6", text: "Net play consistency (tight net shots and lifts)" },
  { id: "singles_7", text: "Ability to maintain quality throughout a 3-game match" },
  { id: "singles_8", text: "Shot variety and tactical play (mixing pace and placement)" },
  { id: "singles_9", text: "Mental endurance and ability to stay focused under pressure" },
  { id: "singles_10", text: "Recovery time needed between games" },
];

const doublesQuestions: Question[] = [
  { id: "doubles_1", text: "Overall doubles playing experience and match exposure" },
  { id: "doubles_2", text: "Quality and consistency of low serves" },
  { id: "doubles_3", text: "Quality and consistency of flick/drive serves" },
  { id: "doubles_4", text: "Flat drive execution (speed and accuracy at mid-court)" },
  { id: "doubles_5", text: "Attacking clear execution from the back court" },
  { id: "doubles_6", text: "Smash power and placement" },
  { id: "doubles_7", text: "Understanding of front-and-back rotation" },
  { id: "doubles_8", text: "Understanding of side-by-side defensive positioning" },
  { id: "doubles_9", text: "Net interception and reflex volleys" },
  { id: "doubles_10", text: "Communication and coordination with partner" },
];

const mixedDoublesQuestions: Question[] = [
  { id: "mixed_1", text: "Overall mixed doubles playing experience and match exposure" },
  { id: "mixed_2", text: "Quality and consistency of low serves" },
  { id: "mixed_3", text: "Quality and consistency of flick/drive serves" },
  { id: "mixed_4", text: "Flat drive execution (speed and accuracy at mid-court)" },
  { id: "mixed_5", text: "Attacking clear execution from the back court" },
  { id: "mixed_6", text: "Smash power and placement" },
  { id: "mixed_7", text: "Understanding of mixed doubles rotation patterns" },
  { id: "mixed_8", text: "Adaptability between front/back positions in mixed format" },
  { id: "mixed_9", text: "Strategic targeting and shot selection in mixed doubles" },
  { id: "mixed_10", text: "Partnership dynamics and on-court communication" },
];

export default function SkillAssessment({ gender, onComplete, onBack }: SkillAssessmentProps) {
  const [currentCategory, setCurrentCategory] = useState<"singles" | "doubles" | "mixed">("singles");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const getCategoryQuestions = () => {
    if (currentCategory === "singles") return singlesQuestions;
    if (currentCategory === "mixed") return mixedDoublesQuestions;
    return doublesQuestions;
  };

  const questions = getCategoryQuestions();
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const option = ratingOptions.find((opt) => opt.value === value);
    if (option) {
      setAnswers({ ...answers, [currentQuestion.id]: option.points });
    }
  };

  const calculateRating = (categoryPrefix: string) => {
    const categoryAnswers = Object.entries(answers).filter(([key]) => 
      key.startsWith(categoryPrefix)
    );
    
    if (categoryAnswers.length === 0) return 1000;
    
    const totalPoints = categoryAnswers.reduce((sum, [, val]) => sum + val, 0);
    const averageRating = totalPoints / categoryAnswers.length;
    
    // Map 1-5 average to rating ranges:
    // 1.0-1.5 = 1000-1200 (Beginner)
    // 1.5-2.5 = 1200-1400 (Developing)
    // 2.5-3.5 = 1400-1700 (Intermediate)
    // 3.5-4.5 = 1700-2000 (Advanced)
    // 4.5-5.0 = 2000-2300 (Expert)
    
    const rating = 1000 + (averageRating - 1) * 325;
    return Math.round(rating);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (currentCategory === "singles") {
        setCurrentCategory("doubles");
        setCurrentQuestionIndex(0);
      } else if (currentCategory === "doubles") {
        setCurrentCategory("mixed");
        setCurrentQuestionIndex(0);
      } else {
        // Calculate final ratings
        const singlesRating = calculateRating("singles");
        const doublesRating = calculateRating("doubles");
        const mixedRating = calculateRating("mixed");

        onComplete({
          singlesRating,
          mensDoublesRating: gender === "Male" ? doublesRating : null,
          womensDoublesRating: gender === "Female" ? doublesRating : null,
          mixedDoublesRating: mixedRating,
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentCategory === "doubles") {
      setCurrentCategory("singles");
      setCurrentQuestionIndex(singlesQuestions.length - 1);
    } else if (currentCategory === "mixed") {
      setCurrentCategory("doubles");
      setCurrentQuestionIndex(doublesQuestions.length - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const canProceed = answers[currentQuestion.id] !== undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="capitalize">
            {currentCategory === "doubles"
              ? gender === "Male"
                ? "Men's Doubles"
                : "Women's Doubles"
              : currentCategory === "mixed"
              ? "Mixed Doubles"
              : "Singles"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <CardTitle className="text-lg mb-2">Rate yourself: {currentQuestion.text}</CardTitle>
          <CardDescription className="mb-4">
            1 = Beginner, 3 = Intermediate, 5 = Expert
          </CardDescription>
          <RadioGroup
            value={
              answers[currentQuestion.id]
                ? String(answers[currentQuestion.id])
                : undefined
            }
            onValueChange={handleAnswer}
          >
            <div className="space-y-3">
              {ratingOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-md border hover-elevate cursor-pointer"
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            data-testid="button-previous"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            data-testid="button-next"
          >
            {currentQuestionIndex === questions.length - 1 &&
            currentCategory === "mixed"
              ? "Complete Assessment"
              : currentQuestionIndex === questions.length - 1
              ? "Next Category"
              : "Next"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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
  options: { value: string; label: string; points: number }[];
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

const singlesQuestions: Question[] = [
  {
    id: "singles_experience",
    text: "How long have you been playing badminton singles?",
    options: [
      { value: "beginner", label: "Less than 6 months", points: 100 },
      { value: "intermediate", label: "6 months to 2 years", points: 200 },
      { value: "advanced", label: "2 to 5 years", points: 300 },
      { value: "expert", label: "More than 5 years", points: 400 },
    ],
  },
  {
    id: "singles_serve",
    text: "How consistent is your serve in singles?",
    options: [
      { value: "learning", label: "Still learning basics", points: 80 },
      { value: "inconsistent", label: "Sometimes good, often faults", points: 150 },
      { value: "consistent", label: "Usually consistent", points: 250 },
      { value: "excellent", label: "Very consistent, can place well", points: 350 },
    ],
  },
  {
    id: "singles_stamina",
    text: "How is your stamina in long singles rallies?",
    options: [
      { value: "low", label: "Tire quickly", points: 80 },
      { value: "moderate", label: "Can handle 2-3 game matches", points: 180 },
      { value: "good", label: "Good endurance", points: 280 },
      { value: "excellent", label: "Can play multiple matches", points: 380 },
    ],
  },
];

const doublesQuestions: Question[] = [
  {
    id: "doubles_experience",
    text: "How long have you been playing doubles?",
    options: [
      { value: "beginner", label: "Less than 6 months", points: 100 },
      { value: "intermediate", label: "6 months to 2 years", points: 200 },
      { value: "advanced", label: "2 to 5 years", points: 300 },
      { value: "expert", label: "More than 5 years", points: 400 },
    ],
  },
  {
    id: "doubles_positioning",
    text: "How well do you understand doubles positioning and rotation?",
    options: [
      { value: "learning", label: "Still learning", points: 90 },
      { value: "basic", label: "Understand basics", points: 170 },
      { value: "good", label: "Good understanding", points: 270 },
      { value: "excellent", label: "Excellent positioning skills", points: 370 },
    ],
  },
  {
    id: "doubles_communication",
    text: "How well do you communicate and coordinate with your partner?",
    options: [
      { value: "learning", label: "Still developing", points: 80 },
      { value: "basic", label: "Basic communication", points: 160 },
      { value: "good", label: "Good coordination", points: 260 },
      { value: "excellent", label: "Excellent teamwork", points: 360 },
    ],
  },
];

const mixedDoublesQuestions: Question[] = [
  {
    id: "mixed_experience",
    text: "How long have you been playing mixed doubles?",
    options: [
      { value: "beginner", label: "Less than 6 months", points: 100 },
      { value: "intermediate", label: "6 months to 2 years", points: 200 },
      { value: "advanced", label: "2 to 5 years", points: 300 },
      { value: "expert", label: "More than 5 years", points: 400 },
    ],
  },
  {
    id: "mixed_strategy",
    text: "How well do you understand mixed doubles strategy?",
    options: [
      { value: "learning", label: "Still learning", points: 90 },
      { value: "basic", label: "Understand basic strategies", points: 180 },
      { value: "good", label: "Good strategic awareness", points: 280 },
      { value: "excellent", label: "Excellent strategic play", points: 380 },
    ],
  },
  {
    id: "mixed_adaptability",
    text: "How well do you adapt your play style in mixed doubles?",
    options: [
      { value: "learning", label: "Still developing", points: 80 },
      { value: "basic", label: "Can adapt somewhat", points: 170 },
      { value: "good", label: "Good adaptability", points: 270 },
      { value: "excellent", label: "Excellent versatility", points: 370 },
    ],
  },
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
    const option = currentQuestion.options.find((opt) => opt.value === value);
    if (option) {
      setAnswers({ ...answers, [currentQuestion.id]: option.points });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const categoryScore = Object.values(
        Object.fromEntries(
          Object.entries(answers).filter(([key]) =>
            key.startsWith(currentCategory === "singles" ? "singles" : currentCategory === "mixed" ? "mixed" : "doubles")
          )
        )
      ).reduce((sum, val) => sum + val, 0);

      const rating = Math.round(1000 + categoryScore);

      if (currentCategory === "singles") {
        setCurrentCategory("doubles");
        setCurrentQuestionIndex(0);
      } else if (currentCategory === "doubles") {
        setCurrentCategory("mixed");
        setCurrentQuestionIndex(0);
      } else {
        const singlesScore = Object.entries(answers)
          .filter(([key]) => key.startsWith("singles"))
          .reduce((sum, [, val]) => sum + val, 0);
        const doublesScore = Object.entries(answers)
          .filter(([key]) => key.startsWith("doubles"))
          .reduce((sum, [, val]) => sum + val, 0);
        const mixedScore = Object.entries(answers)
          .filter(([key]) => key.startsWith("mixed"))
          .reduce((sum, [, val]) => sum + val, 0);

        onComplete({
          singlesRating: Math.round(1000 + singlesScore),
          mensDoublesRating: gender === "Male" ? Math.round(1000 + doublesScore) : null,
          womensDoublesRating: gender === "Female" ? Math.round(1000 + doublesScore) : null,
          mixedDoublesRating: Math.round(1000 + mixedScore),
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
          <CardTitle className="text-lg mb-4">{currentQuestion.text}</CardTitle>
          <RadioGroup
            value={
              answers[currentQuestion.id]
                ? currentQuestion.options.find((opt) => opt.points === answers[currentQuestion.id])?.value
                : undefined
            }
            onValueChange={handleAnswer}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
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

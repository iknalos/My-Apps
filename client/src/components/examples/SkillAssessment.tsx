import SkillAssessment from '../SkillAssessment';

export default function SkillAssessmentExample() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <SkillAssessment
        gender="Female"
        onComplete={(ratings) => console.log('Assessment complete:', ratings)}
        onBack={() => console.log('Back clicked')}
      />
    </div>
  );
}

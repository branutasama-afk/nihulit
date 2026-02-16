
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
  userName: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, userName }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    {
      title: "ברוך הבא למשפחת B.T",
      text: `אהלן ${userName}! הכנו לך מערכת חכמה שתעזור לך לנהל את המשימות והמשמרות שלך בקלות מהנייד.`,
      icon: "✨",
      color: "from-blue-600 to-blue-900"
    },
    {
      title: "נוכחות ומיקום",
      text: "בכל תחילת משמרת, לחץ על 'כניסה'. המערכת מתעדת את המיקום שלך (GPS) כדי לוודא הגעה בזמן.",
      icon: "📍",
      color: "from-red-600 to-red-900"
    },
    {
      title: "ביצוע משימות עם מצלמה",
      text: "חלק מהמשימות ידרשו צילום הוכחה בסיום. פשוט צלם תמונה או וידאו קצר של העבודה שביצעת.",
      icon: "📸",
      color: "from-orange-600 to-orange-900"
    },
    {
      title: "חופשים וחוסרים",
      text: "חסר לך מוצר? הגש דיווח 'חוסרים'. צריך חופש? הגש בקשה בקליק אחד. הכל שקוף ומסודר.",
      icon: "📦",
      color: "from-green-600 to-green-900"
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${currentStep.color} z-[100] flex flex-col items-center justify-center p-8 text-white text-center transition-all duration-700`}>
      <div className="max-w-md w-full flex flex-col h-full justify-between py-12">
        <div className="animate-in fade-in zoom-in duration-700">
          <div className="text-9xl mb-12 drop-shadow-2xl">{currentStep.icon}</div>
          <h2 className="text-4xl font-black mb-6 leading-tight">{currentStep.title}</h2>
          <p className="text-xl font-medium opacity-80 leading-relaxed px-4">{currentStep.text}</p>
        </div>
        
        <div className="space-y-10">
          <div className="flex justify-center gap-3">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 === step ? 'w-12 bg-white' : 'w-4 bg-white/20'}`} 
              />
            ))}
          </div>
          
          <button 
            onClick={() => step < totalSteps ? setStep(step + 1) : onComplete()}
            className="w-full bg-white text-black font-black py-6 rounded-[32px] text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
          >
            {step === totalSteps ? "בוא נתחיל לעבוד" : "המשך להסבר הבא"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

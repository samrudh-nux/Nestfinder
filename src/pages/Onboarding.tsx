import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Building, Home, MapPin, IndianRupee, Heart, Plane, Sun, Users, PawPrint, Briefcase, GraduationCap, ChevronRight, Check } from 'lucide-react';
import api from '../lib/api';

const steps = [
  {
    id: 'purpose',
    title: 'What are you looking for?',
    options: [
      { id: 'RENT', label: 'Rent a place', icon: Home },
      { id: 'BUY', label: 'Buy a property', icon: Building }
    ]
  },
  {
    id: 'city',
    title: 'Which city are you interested in?',
    options: [
      { id: 'Mumbai', label: 'Mumbai', icon: MapPin },
      { id: 'Bangalore', label: 'Bangalore', icon: MapPin },
      { id: 'Delhi', label: 'Delhi', icon: MapPin },
      { id: 'Pune', label: 'Pune', icon: MapPin },
      { id: 'Hyderabad', label: 'Hyderabad', icon: MapPin }
    ]
  },
  {
    id: 'bhk',
    title: 'What size do you need?',
    options: [
      { id: '1', label: '1 BHK', icon: Users },
      { id: '2', label: '2 BHK', icon: Users },
      { id: '3', label: '3 BHK', icon: Users },
      { id: '4', label: '4+ BHK', icon: Building }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Your lifestyle?',
    multi: true,
    options: [
      { id: 'pet', label: 'Pet Owner', icon: PawPrint },
      { id: 'working', label: 'Working Professional', icon: Briefcase },
      { id: 'student', label: 'Student', icon: GraduationCap },
      { id: 'family', label: 'Family with Kids', icon: Users },
      { id: 'gym', label: 'Fitness Enthusiast', icon: Heart }
    ]
  },
  {
    id: 'furnishing',
    title: 'How would you like your home?',
    options: [
      { id: 'FULLY', label: 'Fully Furnished', icon: Home },
      { id: 'SEMI', label: 'Semi-furnished', icon: Building },
      { id: 'UNFURNISHED', label: 'Unfurnished', icon: MapPin }
    ]
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const navigate = useNavigate();

  const handleOptionSelect = (optionId: string) => {
    const step = steps[currentStep];
    if (step.multi) {
      const current = answers[step.id] || [];
      if (current.includes(optionId)) {
        setAnswers({ ...answers, [step.id]: current.filter((id: string) => id !== optionId) });
      } else {
        setAnswers({ ...answers, [step.id]: [...current, optionId] });
      }
    } else {
      setAnswers({ ...answers, [step.id]: optionId });
      setTimeout(nextStep, 300);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      savePreferences();
    }
  };

  const savePreferences = async () => {
    try {
      await api.put('/users/preferences', { preferences: JSON.stringify(answers) });
      navigate('/');
    } catch (e) {
      console.error(e);
      navigate('/');
    }
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-terra-bg flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-2xl w-full space-y-12">
        <div className="space-y-6 text-center">
          <div className="h-2 w-full bg-terra-sidebar rounded-full overflow-hidden border border-terra-border">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-terra-green rounded-full shadow-sm"
            />
          </div>
          <p className="text-[10px] font-bold text-terra-green uppercase tracking-[0.2em] bg-white border border-terra-border px-6 py-2 rounded-full w-fit mx-auto shadow-sm">
            Nurture Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <h1 className="text-4xl md:text-6xl font-serif text-terra-text italic leading-tight text-center">
              {step.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {step.options.map((option) => {
                const isSelected = step.multi 
                  ? (answers[step.id] || []).includes(option.id)
                  : answers[step.id] === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`flex items-center space-x-6 p-8 rounded-[32px] border-2 transition-all text-left group shadow-sm ${
                      isSelected 
                        ? 'border-terra-green bg-white ring-8 ring-terra-green/5' 
                        : 'border-terra-card-border bg-terra-sidebar hover:border-terra-green-light hover:bg-white'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      isSelected ? 'bg-terra-green text-white rotate-3 scale-110' : 'bg-white text-terra-text-muted group-hover:text-terra-green shadow-inner'
                    }`}>
                      <option.icon className="w-7 h-7" />
                    </div>
                    <span className={`text-xl font-serif ${
                      isSelected ? 'text-terra-green italic' : 'text-terra-text'
                    }`}>
                      {option.label}
                    </span>
                    {isSelected && <Check className="ml-auto w-6 h-6 text-terra-green" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {step.multi && (
          <div className="flex justify-center pt-8">
            <button
              onClick={nextStep}
              className="bg-terra-green text-white px-12 py-5 rounded-[24px] font-bold flex items-center space-x-3 hover:bg-terra-green/90 transition-all shadow-xl active:scale-95 group"
            >
              <span className="uppercase tracking-widest text-xs">Grow Further</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

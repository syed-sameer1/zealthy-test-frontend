"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";

interface Component {
  id: number;
  name: string;
}

interface PageData {
  id: number;
  pageNumber: number;
  components: {
    id: number;
    component: Component;
  }[];
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  about: string;
  dob: string;
  street: string;
  state: string;
  city: string;
  country: string;
  zip: string;
}


export default function Register() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [pages, setPages] = useState<PageData[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    about: "",
    dob: "",
    street: "",
    state: "",
    city: "",
    country: "",
    zip: "",
  });
  
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_ENDPOINTS.PAGES);
        if (!response.ok) throw new Error('Failed to fetch page data');
        const data = await response.json();
        setPages(data);
      } catch (error) {
        console.error('Error fetching pages:', error);
        setError('Failed to load form data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPages();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER_USER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          throw new Error('This email is already registered');
        }
        throw new Error(errorData.message || 'Registration failed');
      }

      const { id } = await response.json();
      setUserId(id);
      handleNext();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const components = pages.flatMap(page => 
        page.components.map(({ component }) => ({
          componentId: component.id.toString(),
          data: JSON.stringify(
            component.name === 'about_me' 
              ? { text: formData.about }
              : component.name === 'date_of_birth'
              ? { date: formData.dob }
              : component.name === 'address'
              ? {
                  street: formData.street,
                  city: formData.city,
                  state: formData.state,
                  country: formData.country,
                  zip: formData.zip
                }
              : {}
          )
        }))
      ).filter(comp => comp.data !== '{}');

      const response = await fetch(API_ENDPOINTS.UPDATE_USER(userId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ components })
      });

      if (!response.ok) throw new Error('Update failed');
      router.push('/data');
    } catch (error) {
      alert('Failed to update user data. Please try again.');
    }
  };

  const ProgressBar = () => {
    const steps = ["Register", "Profile", "Address"];
    return (
      <div className="relative mb-8 w-full">
        <div className="absolute top-4 left-0 w-full h-1 bg-gray-300 z-0"></div>
        <div className="flex justify-between relative z-10">
          {steps.map((label, idx) => (
            <div
              className="flex flex-col items-center w-full"
              key={label}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 z-10 ${
                  step === idx + 1
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-xs text-center whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case 'about_me':
        return (
          <div className="space-y-2">
            <label htmlFor="about" className="block text-sm font-medium text-gray-700">
              About Me
            </label>
            <textarea
              id="about"
              name="about"
              placeholder="Tell us about yourself..."
              value={formData.about}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 resize-none"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500">
              Share a brief description about yourself
            </p>
          </div>
        );
  
      case 'date_of_birth':
        return (
          <div className="space-y-2">
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
          </div>
        );
  
      case 'address':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
            
            <div className="space-y-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                id="street"
                type="text"
                name="street"
                placeholder="Enter your street address"
                value={formData.street}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
  
              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  id="zip"
                  type="text"
                  name="zip"
                  placeholder="ZIP Code"
                  value={formData.zip}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
  
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStepContent = (stepNumber: number) => {
    const pageData = pages.find(page => page.pageNumber === stepNumber);
    
    if (!pageData) return null;
  
    return (
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 3) {
            handleFinalSubmit(e);
          } else {
            handleNext();
          }
        }}
      >
        <div className="space-y-6">
          {pageData.components.map((item) => (
            <div key={item.id} className="bg-white rounded-lg">
              {renderComponent(item.component.name)}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handlePrev}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-cyan-500 text-white font-medium rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            {step === 3 ? 'Submit' : 'Next'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white border border-cyan-400 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          Onboarding Wizard
        </h1>
        <ProgressBar />
  
        {step === 1 && (
          <form
            className="space-y-6"
            onSubmit={handleRegisterSubmit}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
  
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>
  
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
  
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-2.5 bg-cyan-500 text-white font-medium rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </form>
        )}
  
        {step === 2 && renderStepContent(2)}
        {step === 3 && renderStepContent(3)}
      </div>
    </div>
  );
}

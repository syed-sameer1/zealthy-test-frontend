"use client";

import { useEffect, useState } from "react";

interface Component {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  component: Component;
  data: string;
  createdAt: string;
}

interface User {
  id: number;
  email: string;
  userData: UserData[];
  createdAt: string;
}

export default function UserDetailTable() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8082/admin/user');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const parseComponentData = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch {
      return {};
    }
  };

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-500">
          <p>{error || 'User data not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <span className="text-sm text-gray-500">
              ID: {user.id}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>
        </div>

        {user.userData.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center text-gray-500">
              <p className="text-lg">No additional user data available</p>
              <p className="text-sm mt-2">User has not completed their profile</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {user.userData.map((data) => {
                const parsedData = parseComponentData(data.data);
                return (
                  <div key={data.id} className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 capitalize mb-4">
                      {data.component.name.replace(/_/g, ' ')}
                    </h3>
                    
                    {data.component.name === 'about_me' && (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {parsedData.text}
                      </p>
                    )}

                    {data.component.name === 'date_of_birth' && (
                      <p className="text-gray-700">
                        {new Date(parsedData.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}

                    {data.component.name === 'address' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Street</p>
                          <p className="mt-1 text-gray-900">{parsedData.street}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">City</p>
                          <p className="mt-1 text-gray-900">{parsedData.city}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">State</p>
                          <p className="mt-1 text-gray-900">{parsedData.state}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Country</p>
                          <p className="mt-1 text-gray-900">{parsedData.country}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">ZIP Code</p>
                          <p className="mt-1 text-gray-900">{parsedData.zip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
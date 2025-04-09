export const API_ENDPOINTS = {
  PAGES: `${process.env.NEXT_PUBLIC_API_BASE_URL}/onboarding/pages`,
  REGISTER_USER: `${process.env.NEXT_PUBLIC_API_BASE_URL}/onboarding/user`,
  UPDATE_USER: (userId: number) => `${process.env.NEXT_PUBLIC_API_BASE_URL}/onboarding/user/${userId}`,
  ADMIN_USER: `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/user`,
  ADMIN_COMPONENT_SETTING: `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/component/setting`,
} as const; 
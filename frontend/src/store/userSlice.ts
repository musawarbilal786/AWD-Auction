import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: number;
  name: string;
  role: string; // frontend role: 'ds', 'superadmin', 'inspector', 'transporter'
  backendRole?: string; // backend role: 'SELLER', 'BUYER', 'BOTH', etc.
  avatar: string;
}

const initialState: UserState = {
  id: 1,
  name: "Hamza Faham",
  role: "ds", // or "inspector" - "ds" - "superadmin" - "transporter"
  backendRole: "BOTH", // default fallback
  avatar: "/images/dummy-profile-logo.jpg",
};

function getInitialUserState(): UserState {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
  }
  return initialState;
}

const userSlice = createSlice({
  name: 'user',
  initialState: getInitialUserState(),
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
      return action.payload;
    },
    setRole(state, action: PayloadAction<string>) {
      state.role = action.payload;
    },
    setBackendRole(state, action: PayloadAction<string>) {
      state.backendRole = action.payload;
    },
    logout() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      return initialState;
    },
  },
});

export const { setUser, setRole, setBackendRole, logout } = userSlice.actions;
export default userSlice.reducer; 
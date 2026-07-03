import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  addresses: Array<{
    id: string;
    type: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  orders: any[];
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  orders: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addAddress: (state, action: PayloadAction<UserProfile["addresses"][0]>) => {
      if (state.profile) {
        state.profile.addresses.push(action.payload);
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.addresses = state.profile.addresses.filter((addr) => addr.id !== action.payload);
      }
    },
    setOrders: (state, action: PayloadAction<any[]>) => {
      state.orders = action.payload;
    },
    clearUserData: (state) => {
      state.profile = null;
      state.orders = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setLoading,
  setError,
  addAddress,
  removeAddress,
  setOrders,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer;

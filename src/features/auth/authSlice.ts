import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@/services";
import { toServiceError } from "@/services/mock/mockDelay";
import type { ServiceError } from "@/types/api";
import type { AdminRole, DemoAdminAccount } from "@/types/auth";
import type { AuthState } from "./authTypes";

const initialState: AuthState = {
  currentAdmin: null,
  sessionRestored: false,
  signInStatus: "idle",
  signInError: null,
  roleSwitchStatus: "idle",
  demoAccounts: [],
  demoAccountsStatus: "idle",
  demoAccountsError: null,
};

type ThunkConfig = { rejectValue: ServiceError };

export const fetchDemoAccounts = createAsyncThunk<DemoAdminAccount[], void, ThunkConfig>(
  "auth/fetchDemoAccounts",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.listDemoAccounts();
    } catch (error) {
      return rejectWithValue(toServiceError(error));
    }
  },
);

export const signInDemo = createAsyncThunk<DemoAdminAccount, string, ThunkConfig>(
  "auth/signInDemo",
  async (accountId, { rejectWithValue }) => {
    try {
      return await authService.signInDemo(accountId);
    } catch (error) {
      return rejectWithValue(toServiceError(error));
    }
  },
);

export const switchDemoRole = createAsyncThunk<DemoAdminAccount, AdminRole, ThunkConfig>(
  "auth/switchDemoRole",
  async (role, { rejectWithValue }) => {
    try {
      return await authService.getDemoAccountForRole(role);
    } catch (error) {
      return rejectWithValue(toServiceError(error));
    }
  },
);

export const restoreDemoSession = createAsyncThunk<DemoAdminAccount | null, string | null>(
  "auth/restoreDemoSession",
  async (accountId) => {
    if (!accountId) return null;
    try {
      return await authService.restoreDemoSession(accountId);
    } catch {
      return null;
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signOut(state) {
      state.currentAdmin = null;
      state.signInStatus = "idle";
      state.signInError = null;
    },
    clearSignInError(state) {
      state.signInError = null;
      if (state.signInStatus === "failed") state.signInStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDemoAccounts.pending, (state) => {
        state.demoAccountsStatus = "loading";
        state.demoAccountsError = null;
      })
      .addCase(fetchDemoAccounts.fulfilled, (state, action) => {
        state.demoAccountsStatus = "succeeded";
        state.demoAccounts = action.payload;
      })
      .addCase(fetchDemoAccounts.rejected, (state, action) => {
        state.demoAccountsStatus = "failed";
        state.demoAccountsError = action.payload ?? {
          code: "UNKNOWN",
          message: "Could not load demo accounts.",
        };
      })
      .addCase(signInDemo.pending, (state) => {
        state.signInStatus = "loading";
        state.signInError = null;
      })
      .addCase(signInDemo.fulfilled, (state, action) => {
        state.signInStatus = "succeeded";
        state.currentAdmin = action.payload;
      })
      .addCase(signInDemo.rejected, (state, action) => {
        state.signInStatus = "failed";
        state.signInError = action.payload ?? { code: "UNKNOWN", message: "Demo sign-in failed." };
      })
      .addCase(switchDemoRole.pending, (state) => {
        state.roleSwitchStatus = "loading";
      })
      .addCase(switchDemoRole.fulfilled, (state, action) => {
        state.roleSwitchStatus = "succeeded";
        state.currentAdmin = action.payload;
      })
      .addCase(switchDemoRole.rejected, (state) => {
        state.roleSwitchStatus = "failed";
      })
      .addCase(restoreDemoSession.fulfilled, (state, action) => {
        state.currentAdmin = action.payload;
        state.sessionRestored = true;
      })
      .addCase(restoreDemoSession.rejected, (state) => {
        state.sessionRestored = true;
      });
  },
});

export const { signOut, clearSignInError } = authSlice.actions;
export default authSlice.reducer;

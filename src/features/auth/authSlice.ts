import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@/services";
import { toServiceError } from "@/services/mock/mockDelay";
import type { ServiceError } from "@/types/api";
import type { AdminIdentity, SignInCredentials } from "@/types/auth";
import type { AuthState } from "./authTypes";

const initialState: AuthState = {
  currentAdmin: null,
  sessionRestored: false,
  sessionError: null,
  signInStatus: "idle",
  signInError: null,
  signOutStatus: "idle",
};

type ThunkConfig = { rejectValue: ServiceError };

export const signIn = createAsyncThunk<AdminIdentity, SignInCredentials, ThunkConfig>(
  "auth/signIn",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.signIn(credentials);
    } catch (error) {
      return rejectWithValue(toServiceError(error));
    }
  },
);

export const restoreSession = createAsyncThunk<AdminIdentity | null, void, ThunkConfig>(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getSession();
    } catch (error) {
      return rejectWithValue(toServiceError(error));
    }
  },
);

/** Clears the local session even when the backend revocation fails. */
export const signOut = createAsyncThunk<void, void>("auth/signOut", async () => {
  try {
    await authService.signOut();
  } catch {
    // The cookies may already be gone; the local session is cleared regardless.
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** The backend rejected the session (expired or revoked) while the portal was open. */
    sessionEnded(state) {
      state.currentAdmin = null;
      state.sessionError = {
        code: "UNAUTHENTICATED",
        message: "Your session has ended. Sign in again to continue.",
      };
    },
    clearSignInError(state) {
      state.signInError = null;
      if (state.signInStatus === "failed") state.signInStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.signInStatus = "loading";
        state.signInError = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.signInStatus = "succeeded";
        state.currentAdmin = action.payload;
        state.sessionRestored = true;
        state.sessionError = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.signInStatus = "failed";
        state.signInError = action.payload ?? { code: "UNKNOWN", message: "Sign-in failed." };
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.currentAdmin = action.payload;
        state.sessionRestored = true;
        state.sessionError = null;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.currentAdmin = null;
        state.sessionRestored = true;
        state.sessionError = action.payload ?? null;
      })
      .addCase(signOut.pending, (state) => {
        state.signOutStatus = "loading";
      })
      .addCase(signOut.fulfilled, (state) => {
        state.signOutStatus = "idle";
        state.currentAdmin = null;
        state.signInStatus = "idle";
        state.signInError = null;
      });
  },
});

export const { clearSignInError, sessionEnded } = authSlice.actions;
export default authSlice.reducer;

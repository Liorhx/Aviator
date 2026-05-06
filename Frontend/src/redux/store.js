import { configureStore, createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { 
    user: JSON.parse(localStorage.getItem("user") || "null"), 
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token")
  },
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateBalance: (state, action) => {
      if (state.user) {
        state.user.balance = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    }
  },
});

const gameSlice = createSlice({
  name: "game",
  initialState: {
    status: "WAITING",
    multiplier: 1.0,
    countdown: 5,
    history: [],
    liveBets: [],
  },
  reducers: {
    setGameState: (state, action) => {
      return { ...state, ...action.payload };
    },
    addHistory: (state, action) => {
      state.history = [action.payload, ...state.history].slice(0, 10);
    },
    addLiveBet: (state, action) => {
      const index = state.liveBets.findIndex(b => 
        b.username === action.payload.username && 
        (b.betIndex || 0) === (action.payload.betIndex || 0)
      );
      if (index !== -1) {
        state.liveBets[index] = { ...state.liveBets[index], ...action.payload };
      } else {
        state.liveBets = [action.payload, ...state.liveBets].slice(0, 50);
      }
    },
    clearLiveBets: (state) => {
      state.liveBets = [];
    }
  },
});

export const { setAuth, logout, updateBalance } = authSlice.actions;
export const { setGameState, addHistory, addLiveBet, clearLiveBets } = gameSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    game: gameSlice.reducer,
  },
});

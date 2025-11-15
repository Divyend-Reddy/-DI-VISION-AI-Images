
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { User, Theme, Page, PaymentRequest } from '../types';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  deductCredits: (amount: number) => boolean;
  addCredits: (userId: number, amount: number) => void;
  page: Page;
  setPage: (page: Page) => void;
  paymentRequests: PaymentRequest[];
  addPaymentRequest: (request: Omit<PaymentRequest, 'id' | 'createdAt' | 'userId' | 'userEmail' | 'status'>) => void;
  updatePaymentRequestStatus: (requestId: number, status: 'approved' | 'rejected') => void;
  allUsers: User[];
  updateUserCredits: (userId: number, newCreditAmount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Admin credentials from PRD
const ADMIN_EMAIL = 'divyendreddy2@gmail.com';
const ADMIN_PASSWORD = 'namadda1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>('landing');
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Theme persistence
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      localStorage.setItem('theme', 'dark');
    }

    // Load payment requests and users from local storage
    const storedRequests = localStorage.getItem('di-vision-payments');
    if (storedRequests) setPaymentRequests(JSON.parse(storedRequests));
    
    const storedUsers = localStorage.getItem('di-vision-users');
    if(storedUsers) setAllUsers(JSON.parse(storedUsers));

  }, []);
  
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  
  // User session persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('di-vision-user');
    if(storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        return newTheme;
    });
  };

  const persistUser = (userData: User | null) => {
    if (userData) {
        localStorage.setItem('di-vision-user', JSON.stringify(userData));
    } else {
        localStorage.removeItem('di-vision-user');
    }
    setUser(userData);
  }
  
  const updateUserInStorage = (updatedUser: User) => {
      const users: User[] = JSON.parse(localStorage.getItem('di-vision-users') || '[]');
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          localStorage.setItem('di-vision-users', JSON.stringify(users));
          setAllUsers(users); // Update state for admin dashboard
      }
  }

  const signup = (name: string, email: string, password: string): boolean => {
    const users: User[] = JSON.parse(localStorage.getItem('di-vision-users') || '[]');
    if(users.some(u => u.email === email)) {
        alert("User with this email already exists.");
        return false;
    }
    const newUser: User = {
        id: Date.now(),
        name,
        email,
        passwordHash: password.split('').reverse().join(''), // Simple "hash" for demo
        credits: 25,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('di-vision-users', JSON.stringify(users));
    setAllUsers(users);
    persistUser(newUser);
    setPage('generator');
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const isAdminLogin = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

    if (isAdminLogin) {
        const adminUser: User = {
            id: 0, name: 'Admin', email: ADMIN_EMAIL, passwordHash: '', credits: 9999, createdAt: new Date().toISOString(), isAdmin: true
        };
        persistUser(adminUser);
        setPage('admin');
        return true;
    }

    const users: User[] = JSON.parse(localStorage.getItem('di-vision-users') || '[]');
    const passwordHash = password.split('').reverse().join('');
    const foundUser = users.find(u => u.email === email && u.passwordHash === passwordHash);
    if(foundUser) {
        persistUser(foundUser);
        setPage('generator');
        return true;
    }
    alert("Invalid email or password.");
    return false;
  };

  const logout = () => {
    persistUser(null);
    setPage('landing');
  };

  const deductCredits = useCallback((amount: number): boolean => {
    if (user && user.credits >= amount && !user.isAdmin) {
        const updatedUser = { ...user, credits: user.credits - amount };
        persistUser(updatedUser);
        updateUserInStorage(updatedUser);
        return true;
    } else if (user?.isAdmin) {
        return true; // Admins have infinite credits
    }
    return false;
  }, [user]);
  
  const addCredits = (userId: number, amount: number) => {
    const users: User[] = JSON.parse(localStorage.getItem('di-vision-users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].credits += amount;
        localStorage.setItem('di-vision-users', JSON.stringify(users));
        setAllUsers(users);
        // If the updated user is the currently logged-in user, update their session
        if(user && user.id === userId){
            persistUser(users[userIndex]);
        }
    }
  };

  const updateUserCredits = (userId: number, newCreditAmount: number) => {
    const users: User[] = JSON.parse(localStorage.getItem('di-vision-users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].credits = newCreditAmount;
        localStorage.setItem('di-vision-users', JSON.stringify(users));
        setAllUsers([...users]); // Trigger re-render
        if(user && user.id === userId){
            persistUser(users[userIndex]);
        }
    }
};

  const addPaymentRequest = (request: Omit<PaymentRequest, 'id' | 'createdAt' | 'userId' | 'userEmail' | 'status'>) => {
      if(!user) return;
      const newRequest: PaymentRequest = {
          ...request,
          id: Date.now(),
          userId: user.id,
          userEmail: user.email,
          status: 'pending',
          createdAt: new Date().toISOString()
      };
      const updatedRequests = [...paymentRequests, newRequest];
      setPaymentRequests(updatedRequests);
      localStorage.setItem('di-vision-payments', JSON.stringify(updatedRequests));
  };
  
  const updatePaymentRequestStatus = (requestId: number, status: 'approved' | 'rejected') => {
      const updatedRequests = paymentRequests.map(req => 
          req.id === requestId ? { ...req, status } : req
      );
      setPaymentRequests(updatedRequests);
      localStorage.setItem('di-vision-payments', JSON.stringify(updatedRequests));
  };

  const value = { theme, toggleTheme, user, login, signup, logout, deductCredits, addCredits, page, setPage, paymentRequests, addPaymentRequest, updatePaymentRequestStatus, allUsers, updateUserCredits };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

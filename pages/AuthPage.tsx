
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex justify-center items-center py-12 animate-slide-in-up">
      <div className="w-full max-w-md p-8 space-y-8 bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark border border-light-border dark:border-dark-border backdrop-filter backdrop-blur">
        <h2 className="text-3xl font-bold text-center">{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
        {isLogin ? <LoginForm /> : <SignupForm />}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-primary hover:underline ml-2">
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const LoginForm: React.FC = () => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField id="login-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <InputField id="login-password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <AuthButton>Login</AuthButton>
    </form>
  );
};

const SignupForm: React.FC = () => {
  const { signup } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    signup(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField id="signup-name" label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
      <InputField id="signup-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <InputField id="signup-password" label="Password (min 8 characters)" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <InputField id="signup-confirm-password" label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      <AuthButton>Create Account</AuthButton>
    </form>
  );
};

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, ...props }) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input 
      id={id} 
      {...props} 
      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
    />
  </div>
);

const AuthButton: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <button type="submit" className="w-full py-3 px-4 text-white font-semibold bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-105">
        {children}
    </button>
)

export default AuthPage;

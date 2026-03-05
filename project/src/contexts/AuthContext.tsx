import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Customer } from '../types/database';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadCustomer(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadCustomer(session.user.id);
        } else {
          setCustomer(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadCustomer(userId: string) {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    setCustomer(data);
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: data.user.id,
          name,
          email,
        });

      if (customerError) throw customerError;

      const { error: cartError } = await supabase
        .from('carts')
        .insert({
          customer_id: (await supabase
            .from('customers')
            .select('customer_id')
            .eq('user_id', data.user.id)
            .single()).data?.customer_id,
        });

      if (cartError) throw cartError;
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const value = {
    user,
    customer,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import initialCustomers from '../data/customers.json';
import initialSales from '../data/sales.json';
import initialExcluded from '../data/excluded.json';
import promptData from '../data/prompt.json';

// ============================================================
// Data Version Management
// When data is updated, increment this version string.
// If the stored version doesn't match, localStorage is auto-reset.
// ============================================================
const DATA_VERSION = '2026-04-13-v3';
const VERSION_KEY = 'ginza_data_version';

export interface Customer {
  id: string;
  name: string;
  nickname: string;
  star: boolean;
  sendCount: number;
  lastSendDate: string;
  daysSinceLastSend: string;
  rank: string;
  trackerNotes: string;
  excluded: boolean;
  hasKarte: boolean;
  age: string;
  occupation: string;
  location: string;
  family: string;
  birthday: string;
  hobbies: string[];
  drinks: string;
  visitFrequency: string;
  lastVisit: string;
  relationshipLevel: string;
  notes: string;
  rawContent: string;
  displayName?: string;
  customMemo?: string;
}

export interface SalesRecord {
  date: string;
  month: number;
  time: string;
  customerName: string;
  partySize: number;
  subtotal: number;
  total: number;
  drinks: string;
}

export interface ExcludedCustomer {
  name: string;
  nickname: string;
  reason: string;
}

export interface SendHistory {
  customerName: string;
  message: string;
  sentAt: string;
}

interface DataContextType {
  customers: Customer[];
  sales: SalesRecord[];
  excluded: ExcludedCustomer[];
  sendHistory: SendHistory[];
  promptContent: string;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addSalesRecord: (record: SalesRecord) => void;
  deleteSalesRecord: (date: string, customerName: string) => void;
  addExcluded: (item: ExcludedCustomer) => void;
  removeExcluded: (name: string) => void;
  addSendHistory: (record: SendHistory) => void;
  updateSendCount: (customerName: string) => void;
  getCustomerByName: (name: string) => Customer | undefined;
  isExcluded: (name: string) => boolean;
  monthlyGoal: number;
  dataVersion: string;
}

const DataContext = createContext<DataContextType | null>(null);

/**
 * Check if stored data version matches current version.
 * If not, clear all ginza_ prefixed localStorage keys and update version.
 * This ensures that when data files are updated in a new deploy,
 * users automatically get fresh data without manual reset.
 */
function checkAndMigrateVersion(): boolean {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== DATA_VERSION) {
      // Version mismatch - clear all CRM data from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ginza_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      // Set new version
      localStorage.setItem(VERSION_KEY, DATA_VERSION);
      console.log(`[CRM] Data version updated: ${storedVersion || 'none'} → ${DATA_VERSION}. Cache cleared.`);
      return true; // was reset
    }
    return false; // no reset needed
  } catch {
    return false;
  }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
}

function saveToStorage(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// Run version check before any data loading
checkAndMigrateVersion();

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage('ginza_customers', initialCustomers as Customer[])
  );
  const [sales, setSales] = useState<SalesRecord[]>(() =>
    loadFromStorage('ginza_sales', initialSales as SalesRecord[])
  );
  const [excluded, setExcluded] = useState<ExcludedCustomer[]>(() =>
    loadFromStorage('ginza_excluded', initialExcluded as ExcludedCustomer[])
  );
  const [sendHistory, setSendHistory] = useState<SendHistory[]>(() =>
    loadFromStorage('ginza_send_history', [])
  );

  const monthlyGoal = 3000000;

  useEffect(() => { saveToStorage('ginza_customers', customers); }, [customers]);
  useEffect(() => { saveToStorage('ginza_sales', sales); }, [sales]);
  useEffect(() => { saveToStorage('ginza_excluded', excluded); }, [excluded]);
  useEffect(() => { saveToStorage('ginza_send_history', sendHistory); }, [sendHistory]);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const addSalesRecord = useCallback((record: SalesRecord) => {
    setSales(prev => [...prev, record]);
  }, []);

  const deleteSalesRecord = useCallback((date: string, customerName: string) => {
    setSales(prev => prev.filter(s => !(s.date === date && s.customerName === customerName)));
  }, []);

  const addExcluded = useCallback((item: ExcludedCustomer) => {
    setExcluded(prev => [...prev.filter(e => e.name !== item.name), item]);
  }, []);

  const removeExcluded = useCallback((name: string) => {
    setExcluded(prev => prev.filter(e => e.name !== name));
  }, []);

  const addSendHistory = useCallback((record: SendHistory) => {
    setSendHistory(prev => [record, ...prev]);
  }, []);

  const updateSendCount = useCallback((customerName: string) => {
    const now = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    setCustomers(prev => prev.map(c => {
      if (c.name === customerName || c.nickname === customerName) {
        return {
          ...c,
          sendCount: c.sendCount + 1,
          lastSendDate: now,
          daysSinceLastSend: '0'
        };
      }
      return c;
    }));
  }, []);

  const getCustomerByName = useCallback((name: string) => {
    return customers.find(c =>
      c.name === name || c.nickname === name ||
      c.name.includes(name) || name.includes(c.name)
    );
  }, [customers]);

  const isExcluded = useCallback((name: string) => {
    return excluded.some(e =>
      e.name === name || e.nickname === name ||
      name.includes(e.nickname) || e.name.includes(name)
    );
  }, [excluded]);

  return (
    <DataContext.Provider value={{
      customers,
      sales,
      excluded,
      sendHistory,
      promptContent: promptData.content,
      updateCustomer,
      addSalesRecord,
      deleteSalesRecord,
      addExcluded,
      removeExcluded,
      addSendHistory,
      updateSendCount,
      getCustomerByName,
      isExcluded,
      monthlyGoal,
      dataVersion: DATA_VERSION,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

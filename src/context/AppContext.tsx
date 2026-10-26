import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  Company, CreditApplication, ApplicationStatus, CreditProduct,
  ScoringResult, CreditDecision, StatusChange, ViewMode
} from '../types';
import { companies, creditProducts, initialApplications } from '../data/synthetic';
import { calculateScoring, makeCreditDecision } from '../scoring';

interface AppState {
  viewMode: ViewMode;
  currentCompanyId: string | null;
  applications: CreditApplication[];
  companies: Company[];
  products: CreditProduct[];
  selectedApplicationId: string | null;
}

type AppAction =
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_COMPANY'; payload: string }
  | { type: 'CREATE_APPLICATION'; payload: { id: string; companyId: string; productId: string; amount: number; term: number; purpose: string } }
  | { type: 'SUBMIT_APPLICATION'; payload: string }
  | { type: 'ADVANCE_APPLICATION'; payload: string }
  | { type: 'RUN_SCORING'; payload: string }
  | { type: 'MAKE_DECISION'; payload: string }
  | { type: 'SELECT_APPLICATION'; payload: string | null }
  | { type: 'REQUEST_ADDITIONAL_INFO'; payload: { applicationId: string; field: string; description: string } }
  | { type: 'RESPOND_TO_INFO_REQUEST'; payload: { applicationId: string; requestId: string; response: string } };

const initialState: AppState = {
  viewMode: 'client',
  currentCompanyId: 'company-1',
  applications: initialApplications,
  companies,
  products: creditProducts,
  selectedApplicationId: null,
};

function addStatusChange(
  app: CreditApplication,
  to: ApplicationStatus,
  comment: string,
  actor: StatusChange['actor']
): CreditApplication {
  return {
    ...app,
    status: to,
    updatedAt: new Date().toISOString(),
    statusHistory: [
      ...app.statusHistory,
      { from: app.status, to, timestamp: new Date().toISOString(), comment, actor }
    ]
  };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_COMPANY':
      return { ...state, currentCompanyId: action.payload };

    case 'CREATE_APPLICATION': {
      const newApp: CreditApplication = {
        id: action.payload.id,
        companyId: action.payload.companyId,
        productId: action.payload.productId,
        requestedAmount: action.payload.amount,
        requestedTerm: action.payload.term,
        purpose: action.payload.purpose,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [{
          from: 'draft',
          to: 'draft',
          timestamp: new Date().toISOString(),
          comment: 'Заявка создана',
          actor: 'client'
        }]
      };
      return {
        ...state,
        applications: [...state.applications, newApp],
        selectedApplicationId: newApp.id
      };
    }

    case 'SUBMIT_APPLICATION': {
      const apps = state.applications.map(app => {
        if (app.id === action.payload) {
          return addStatusChange(app, 'submitted', 'Заявка отправлена на рассмотрение', 'client');
        }
        return app;
      });
      return { ...state, applications: apps };
    }

    case 'ADVANCE_APPLICATION': {
      const apps = state.applications.map(app => {
        if (app.id !== action.payload) return app;
        
        const transitions: Record<string, ApplicationStatus> = {
          'submitted': 'data_validation',
          'data_validation': 'data_enrichment',
          'data_enrichment': 'scoring',
          'scoring': 'review',
          'approved': 'documents_pending',
          'approved_with_changes': 'documents_pending',
          'documents_pending': 'completed',
        };
        
        const nextStatus = transitions[app.status];
        if (nextStatus) {
          const comments: Record<string, string> = {
            'data_validation': 'Данные проверены на полноту и корректность',
            'data_enrichment': 'Получены данные из ЕГРЮЛ, БКИ и ФНС',
            'scoring': 'Скоринговая оценка завершена',
            'review': 'Заявка передана на рассмотрение аналитику',
            'documents_pending': 'Договор подписан, ожидание выдачи',
            'completed': 'Кредитные средства выпущены на счёт',
          };
          return addStatusChange(app, nextStatus, comments[nextStatus] || '', 'system');
        }
        return app;
      });
      return { ...state, applications: apps };
    }

    case 'RUN_SCORING': {
      const apps = state.applications.map((app): CreditApplication => {
        if (app.id !== action.payload) return app;
        
        const company = state.companies.find(c => c.id === app.companyId);
        const product = state.products.find(p => p.id === app.productId);
        if (!company || !product) return app;

        const scoring = calculateScoring(company, app, product);
        const decision = makeCreditDecision(scoring, app, product, company);

        let updatedApp: CreditApplication = { ...app, scoringResult: scoring, decision };
        
        // Автоматически определяем следующий статус
        if (decision.type === 'approved') {
          updatedApp = addStatusChange(updatedApp, 'approved', decision.comment, 'system');
        } else if (decision.type === 'approved_with_changes') {
          updatedApp = addStatusChange(updatedApp, 'approved_with_changes', decision.comment, 'system');
        } else if (decision.type === 'additional_info') {
          updatedApp = addStatusChange(updatedApp, 'additional_info_requested', decision.comment, 'system');
        } else {
          updatedApp = addStatusChange(updatedApp, 'rejected', decision.comment, 'system');
        }

        return updatedApp;
      });
      return { ...state, applications: apps };
    }

    case 'MAKE_DECISION': {
      const apps = state.applications.map((app): CreditApplication => {
        if (app.id !== action.payload) return app;
        
        const company = state.companies.find(c => c.id === app.companyId);
        const product = state.products.find(p => p.id === app.productId);
        if (!company || !product) return app;

        const scoring = calculateScoring(company, app, product);
        const decision = makeCreditDecision(scoring, app, product, company);

        let updatedApp: CreditApplication = { ...app, scoringResult: scoring, decision };
        
        if (decision.type === 'approved') {
          updatedApp = addStatusChange(updatedApp, 'approved', decision.comment, 'manager');
        } else if (decision.type === 'approved_with_changes') {
          updatedApp = addStatusChange(updatedApp, 'approved_with_changes', decision.comment, 'manager');
        } else if (decision.type === 'additional_info') {
          updatedApp = addStatusChange(updatedApp, 'additional_info_requested', decision.comment, 'manager');
        } else {
          updatedApp = addStatusChange(updatedApp, 'rejected', decision.comment, 'manager');
        }

        return updatedApp;
      });
      return { ...state, applications: apps };
    }

    case 'SELECT_APPLICATION':
      return { ...state, selectedApplicationId: action.payload };

    case 'REQUEST_ADDITIONAL_INFO': {
      const apps = state.applications.map(app => {
        if (app.id !== action.payload.applicationId) return app;
        const request = {
          id: `req-${Date.now()}`,
          field: action.payload.field,
          description: action.payload.description,
          requestedAt: new Date().toISOString()
        };
        return {
          ...app,
          additionalInfoRequests: [...(app.additionalInfoRequests || []), request]
        };
      });
      return { ...state, applications: apps };
    }

    case 'RESPOND_TO_INFO_REQUEST': {
      const apps = state.applications.map(app => {
        if (app.id !== action.payload.applicationId) return app;
        const updatedRequests = (app.additionalInfoRequests || []).map(req => {
          if (req.id === action.payload.requestId) {
            return { ...req, respondedAt: new Date().toISOString(), response: action.payload.response };
          }
          return req;
        });
        return { ...app, additionalInfoRequests: updatedRequests };
      });
      return { ...state, applications: apps };
    }

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getCurrentCompany: () => Company | undefined;
  getApplication: (id: string) => CreditApplication | undefined;
  getProduct: (id: string) => CreditProduct | undefined;
  getCompany: (id: string) => Company | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const getCurrentCompany = () => state.companies.find(c => c.id === state.currentCompanyId);
  const getApplication = (id: string) => state.applications.find(a => a.id === id);
  const getProduct = (id: string) => state.products.find(p => p.id === id);
  const getCompany = (id: string) => state.companies.find(c => c.id === id);

  return (
    <AppContext.Provider value={{ state, dispatch, getCurrentCompany, getApplication, getProduct, getCompany }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

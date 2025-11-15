import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FunctionProvider } from "./contexts/FunctionContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import UnderConstruction from "./components/UnderConstruction";
import { CustomThemeProvider } from './contexts/ThemeProvider';

// import { useLocation } from "react-router-dom";

// 使用 Vite 的 glob 導入
const pages = import.meta.glob('./pages/**/*.jsx');

// 動態導入頁面組件
const importPage = (path) => {
  // 構建完整的文件路徑
  const fullPath = `./pages/${path}.jsx`;
  
  console.log('Looking for page:', fullPath);
  console.log('Available pages:', Object.keys(pages));

  return lazy(() => {
    const importFunc = pages[fullPath];
    if (importFunc) {
      return importFunc();
    }
    console.warn(`Page not found: ${fullPath}`);
    return Promise.resolve({ default: UnderConstruction });
  });
};

// 添加加载组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div>Loading...</div>
  </div>
);

// 動態路由組件
const DynamicPage = () => {
  const location = useLocation();
  // 移除 /app/ 前綴並獲取實際路徑
  const path = location.pathname.replace('/app/', '');
  console.log('Current path:', path);
  const Component = importPage(path);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
};

// 添加路由配置
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_normalizeFormMethod: true
  }
};

// 添加受保护路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // 如果用户已认证但尝试访问登录页，重定向到应用首页
  if (location.pathname === '/login' && isAuthenticated) {
    return <Navigate to="/app/Maps/GlobalMaps" replace />;
  }
  
  return children;
};

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <FunctionProvider>
          <I18nextProvider i18n={i18n}>
            <Routes {...routerConfig}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={
                <ProtectedRoute>
                  <Login />
                </ProtectedRoute>
              } />
              <Route path="/app" element={<MainLayout />}>
                <Route index element={<Navigate to="/app/Maps/GlobalMaps" replace />} />
                <Route path="under-construction" element={<UnderConstruction />} />
                <Route path="*" element={<DynamicPage />} />
              </Route>
            </Routes>
          </I18nextProvider>
        </FunctionProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;

import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate, } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import "./index.css"
import useUserStore from './store/userStore';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from "@/components/Header"

const Home = lazy(() => import('./pages/Home'));
const Board = lazy(() => import('./pages/Board'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const authenticate = useUserStore((state) => state.isAuthenticated)
  return authenticate ? element : <Navigate to="/" replace />
}

const AuthRoute = ({ element }: { element: JSX.Element }) => {
  const authenticate = useUserStore((state) => state.isAuthenticated)
  return !authenticate ? element : <Navigate to="/home" replace />
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Header />}>
      <Route index element={
        <Suspense fallback={<div>Loading...</div>}>
          <AuthRoute element={<Login />} />
        </Suspense>
      } />
      <Route path="register" element={
        <Suspense fallback={<div>Loading...</div>}>
          <AuthRoute element={<Register />} />
        </Suspense>
      } />
      <Route path="home" element={
        <Suspense fallback={<div>Loading...</div>}>
          <ProtectedRoute element={<Home />} />
        </Suspense>
      } />
      <Route path="board/:boardId" element={
        <Suspense fallback={<div>Loading...</div>}>
          <ProtectedRoute element={<Board />} />
        </Suspense>
      } />
      <Route path="*" element={
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorPage />
        </Suspense>
      } />
    </Route>
  )
)

function App() {
  return (
    <div>
      <ToastContainer />
      <RouterProvider router={router} />
    </div>
  )
}

export default App

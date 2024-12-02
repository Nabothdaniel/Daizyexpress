import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./Context/useContext.tsx";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
// import Dashboard from "./Pages/Dashboard.tsx";
import Login from "./Pages/Login.tsx";
import SignUp from "./Pages/SignUp.tsx";
import UserPages from "./Pages/AuthorizedPages/UserPage.tsx";
import AdminPages from "./Pages/AuthorizedPages/AdminPages.tsx";
import LandingPage from "./Pages/LandingPage.tsx";
import ForgottenPwd from "./Pages/ForgottenPwd.tsx";
import UploadPage from "./Pages/AuthorizedPages/UploadPage.tsx";
import DocumentPage from "./Pages/AuthorizedPages/DocumentPage.tsx";
import TotalDocuments from "./Pages/AuthorizedPages/TotalDocuments.tsx";


function AppRouter() {
	const { isAuthenticated, userRole } = useAuth();

	const router = createBrowserRouter([
		{
			path: "/",
			element: <App />,
			children: [
				{
					path: "/",
					element: <LandingPage />,
				},
				{
					path: "/forgot",
					element: <ForgottenPwd />,
				},
				{
					path: "/login",
					element: !isAuthenticated ? <Login /> : userRole === "admin" ? <Navigate to="/admin" /> : <Navigate to="/user" />,
				},
				// {
				// 	path: "/register",
				// 	element: !isAuthenticated ? <SignUp /> : userRole === "admin" ? <Navigate to="/admin" /> : <Navigate to="/user" />,
				// },
				// {
				// 	path: "/user",
				// 	element: isAuthenticated && userRole === "user" ? <UserPages /> : <Navigate to={isAuthenticated ? "/admin" : "/login"} />,
				// },
				{
					path: "/admin",
					element: <AdminPages />,
				},
				//
				{
					path: "/register",
					element: !isAuthenticated ? <SignUp /> : userRole === "admin" ? <Navigate to="/admin" /> : <Navigate to="/user" />,
				}, 
				{
					path: "/userdashboard",
					element: <UserPages />
				},
				{
					path: "/upload",
					element: <UploadPage />,
				},
				{
					path: "/document",
					element: <DocumentPage />,
				},
				{
					path: "/totaldocuments",
					element: <TotalDocuments />,
				},
			],
		},
	]);

	return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<AppRouter />
		</AuthProvider>
	</StrictMode>
);

import { createBrowserRouter, Navigate } from "react-router";
import { FileSelectionView } from "./views/fileSelectionView.tsx";
import { routes } from "./routes.ts";
import { NewFileView } from "./views/newFileView.tsx";
import App from "./App.tsx";
import { AnalysisView } from "./views/analysisView.tsx";
import ErrorBoundary from "./components/errorBoundary.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <FileSelectionView />
          </ErrorBoundary>
        ),
      },
      {
        path: routes.newAnalysis,
        element: (
          <ErrorBoundary>
            <NewFileView />
          </ErrorBoundary>
        ),
      },
      {
        path: routes.analysis,
        element: (
          <ErrorBoundary>
            <AnalysisView />
          </ErrorBoundary>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

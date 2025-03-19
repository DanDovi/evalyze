import { createBrowserRouter } from "react-router";
import { FileSelectionView } from "./views/fileSelectionView.tsx";
import { routes } from "./routes.ts";
import { NewFileView } from "./views/newFileView.tsx";
import App from "./App.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children: [
      {
        index: true,
        element: <FileSelectionView />,
      },
      {
        path: routes.newFile,
        element: <NewFileView />,
      },
      {
        path: "*",
        element: <div>Not found</div>,
      },
    ],
  },
]);

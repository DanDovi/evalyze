import "./App.scss";
import { Shell } from "./components/shell.tsx";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <Shell />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;

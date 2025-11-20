import AppRoutes from "./routes/AppRoutes";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/global.css";
import { AuthProvider } from "./authentication/AuthContext";

function App() {
  return (
    <>
     <AuthProvider>
      <AppRoutes />
      </AuthProvider>
    </>
  )


}

export default App;
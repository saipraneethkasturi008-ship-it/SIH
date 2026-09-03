import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";

import Dashboard from "./pages/Dashboard";
import Assistant from "./pages/Assistant";
import Calculator from "./pages/Calculator";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Marketing from "./pages/Marketing";
import Schemes from "./pages/Schemes";
import Profile from "./pages/Profile";

import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/onboarding" element={<Onboarding />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/assistant"
          element={
            <Layout>
              <Assistant />
            </Layout>
          }
        />

        <Route
          path="/calculator"
          element={
            <Layout>
              <Calculator />
            </Layout>
          }
        />

        <Route
          path="/sales"
          element={
            <Layout>
              <Sales />
            </Layout>
          }
        />

        <Route
          path="/expenses"
          element={
            <Layout>
              <Expenses />
            </Layout>
          }
        />

        <Route
          path="/marketing"
          element={
            <Layout>
              <Marketing />
            </Layout>
          }
        />

        <Route
          path="/schemes"
          element={
            <Layout>
              <Schemes />
            </Layout>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
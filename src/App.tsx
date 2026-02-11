import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import Home from "./pages/Home";
import TopUp from "./pages/TopUp";
import History from "./pages/History";
import AddDevice from "./pages/AddDevice";

import "./styles/app.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/topup" element={<TopUp />} />
          <Route path="/history" element={<History />} />
          <Route path="/devices/add" element={<AddDevice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

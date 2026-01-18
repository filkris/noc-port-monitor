import { createRoot } from "react-dom/client";
import "./app.css";
import Auth from "./components/Auth";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

function App() {
	return (
		<>
			<Auth />
			<Header />
			<Main />
			<Footer />
		</>
	);
}

createRoot(document.getElementById("app")).render(<App />);

import { createRoot } from "react-dom/client";
import "./app.css";

function App() {
	return <div>Hello World</div>;
}

createRoot(document.getElementById("app")).render(<App />);

import { useState } from 'react';
import './App.css';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import HomePage from './Components/HomePage/HomePage';
import Chatbot from './utils/Chatbot';

function App() {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChatbot = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <Chatbot isOpen={isOpen} setIsOpen={handleOpenChatbot} />

            <header>
                <Header />
            </header>

            <main>
                <HomePage />
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;

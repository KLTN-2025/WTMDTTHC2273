import { useState } from 'react';
import './App.css';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import HomePage from './Components/HomePage/HomePage';
import Chatbot from './utils/chatbot';

function App() {
    return (
        <div>
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

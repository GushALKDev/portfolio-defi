import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';

import Home from './Home';
import Token from './Token';
import Staking from './Staking';
import Footer from './Footer';

class App extends Component {
    
    render() {
        return (
            <BrowserRouter>
                <div className="App">
                    <div>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/token" element={<Token />} />
                            <Route path="/staking" element={<Staking />} />
                            <Route path="*" element={<Home />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
                <div className='spacer'></div>
            </BrowserRouter>
        );
    }

}

export default App;
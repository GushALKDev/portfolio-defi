import React from 'react';
import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import logo from '../img/defi.png';
import portfolio from "../img/circle1.png"
import './App.css'

const Navigation = ({ account }) => {
    return (
        <Navbar expand="lg" bg="dark" variant="dark">
            <Container>
                <Navbar.Brand><a href='https://www.gustavomartinalonso.com'><img className='portfolio' src={portfolio} alt="Portfolio"/></a>
                    <img className='logo' src={logo} alt="Lucky Lottery"/> GMA DeFi
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar navbar-dark bg-primary" />
                <Navbar.Collapse id="navbar navbar-dark bg-primary">
                    <Nav className="menu me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/token">Token</Nav.Link>
                        <Nav.Link as={Link} to="/staking">Staking</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link
                            href={`https://ropsten.etherscan.io/address/${account}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button nav-button btn-sm mx-4">
                            <Button variant="outline-light">
                                {account.slice(0, 10) + '...' + account.slice(32, 42)}
                            </Button>
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )

}

export default Navigation;
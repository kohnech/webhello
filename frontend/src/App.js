import React from 'react';
import './App.css';
import Home from './Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes instead of Switch
import EmployeeList from './EmployeeList';
import EmployeeEdit from './EmployeeEdit';

function App() {
  return (
    <Router>
      <Routes> {/* Replace Switch with Routes */}
        <Route path='/' element={<Home />} /> {/* Use element prop instead of component */}
        <Route path='/employees' element={<EmployeeList />} /> {/* Use element prop instead of component */}
        <Route path='/employees/:id' element={<EmployeeEdit />} /> {/* Use element prop instead of component */}
      </Routes> {/* Replace Switch with Routes */}
    </Router>
  );
}

export default App;

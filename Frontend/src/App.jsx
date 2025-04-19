import React, { useState, useEffect } from 'react'
import './App.css'
import { Routes , Route} from 'react-router-dom'
import SignUpPage from './Pages/SignUpPage'
import Navbar from './Pages/Navbar'
import LoginPage from './Pages/LoginPage'
import UserDashBoard from './Pages/UserDashboard'
import AddLoan from './Pages/AddLoand'
import LoanDetail from './Pages/LoanDetail'
import HomePage from './Pages/HomePage'

function App() {
  return (
    <div className='min-h-screen w-[100%]'>
      <Navbar/>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/signUp" element={<SignUpPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>

        <Route path='/user/dashboard'  element={<UserDashBoard/>}/>
        <Route path='/addLoan' element={<AddLoan/>} />
        <Route path='/loan/:loanId/details' element={<LoanDetail/>}/>
      </Routes>
    </div>
  )
}

export default App

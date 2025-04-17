import { useState, useEffect, use } from 'react'
import './App.css'
import { apiConnecter } from './utils/apiconnector'

function App() {
  const [count, setCount] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiConnecter("GET", "/hi");
      console.log(res.data); // your array or object
    };
    fetchData();
  }, []);

  return (
    <>
      <h1>hii</h1>
      <div>
        {count.map((item, index) => (
          <div key={index}>{item.text1}</div>
        ))}
      </div>
    </>
  )
}

export default App

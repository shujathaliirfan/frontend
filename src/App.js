import React, { useState, useEffect } from "react";
import axios from 'axios';
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [password, setPassword] = useState("");
  const [count, setCount] = useState(0);
  const [diff,setDiff] = useState('');
  const [number ,setNumber]= useState('');
  const [num,setNum] = useState('')
  const [list,setList] = useState([])
  


  useEffect(()=> {

    getlist()

  },[list])


  const getlist = () => {
    axios.get('http://localhost:4000/api/password/list')
    .then(function (response) {
     setList(response.data)
    })
    .catch(function (error) {
      setList([])
    });
  
  

  

  }


  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassword(value)

    
  };

  const handleDiffSubmit = () => {

    let nums = num.split(",").map(x => parseInt(x))
  
    
    const middle = parseInt(nums.length/2);
    
    const firstHalf = nums.slice(0, middle);
    const secondHalf = nums.slice(middle);
    
    const firstHalfSum = firstHalf.reduce((a, b) => a+b);
    const secondHalfSum = secondHalf.reduce((a, b) => a+b);
 
    const findKSum = (array, set, sum, index, k) => {
        
        if (k===0) return set.add(sum);
        
        if (index===array.length) return;
        
        findKSum(array, set, sum, index+1, k);
       
        findKSum(array, set, sum+array[index], index+1, k-1);
    }
    
    const populateArray = (array, dp, isSecondArray) => {
        for(let i=1; i<=array.length; i++) {
           
            let set = new Set();
            findKSum(array, set, 0, 0, i);
            
            set = [...set.values()];
           
            if(isSecondArray) {
                set.sort((a,b) => a-b);
            }
            dp[i] = (set);
        }
    }
   
    const firstDp = [[0]];
    const secondDp = [[0]];
    populateArray(firstHalf, firstDp, false);
    populateArray(secondHalf, secondDp, true);
    let min = Infinity;
   
    for (let i = 1; i<firstDp.length; i++) {
       
        for (const num1 of firstDp[i]) {
            
            const remainingNum1 = firstHalfSum-num1;
           
            const remainingLength = secondHalf.length - i;
           
            let left = 0;
            let right = secondDp[remainingLength].length -1;
            while(left <= right) {
                let mid = left+parseInt((right-left)/2);
                
                const num2 = secondDp[remainingLength][mid];
               
                const remainingNum2 = secondHalfSum-num2;
                const firstSum = num1+num2;
                const secondSum = remainingNum1+remainingNum2;
               
                if(firstSum === secondSum) {
                  setDiff(0);
                  return
                };
               
                min = Math.min(min, Math.abs(firstSum-secondSum));
                if(firstSum > secondSum) right = mid-1;
                else left = mid+1;
            }
        }
    }

  
    setDiff(min)
  
      

    
  };


  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    setNumber(value);


  };


  const handleSubmit = () => {

    if(password){
      let steps = 0;
      let mustAdd = 0;
  
      if (!password.match(/[A-Z]/)) {
        mustAdd++;
      }
      if (!password.match(/[a-z]/)) {
        mustAdd++;
      }
      if (!password.match(/\d/)) {
        mustAdd++;
      }
  
      let groups = password.match(/(.)\1*/g).filter((x) => x.length > 2);
  
      if (password.length <= 20) {
        groups.forEach((group) => {
          steps += Math.trunc(group.length / 3);
          mustAdd -= Math.trunc(group.length / 3);
        });
      }
  
      if (password.length <= 20) {
        mustAdd = mustAdd > 0 ? mustAdd : 0;
        if (password.length + steps >= 6) {
          steps += mustAdd;
        } else {
          if (mustAdd > 6 - (password.length + steps)) {
            steps += mustAdd;
          } else {
            steps += 6 - (password.length + steps);
          }
        }
      }
  
      if (password.length > 20) {
        let mustRemove = password.length - 20;
        let lengths = [];
        let plus = [];
        let chL = 0;
        for (let i = 1; i <= 3; i++) {
          for (let k = 0; k < groups.length; k++) {
            if (plus[k] === undefined) {
              plus[k] = 0;
            }
            chL = groups[k].length - plus[k];
            if (lengths[k] === undefined) {
              lengths[k] = chL;
            }
            const rec = () => {
              if (
                Math.trunc((chL - i) / 3) < Math.trunc(chL / 3) &&
                password.length - steps - i >= 6 &&
                mustRemove >= i &&
                chL > 2 &&
                lengths[k] - i > 0
              ) {
                steps += i;
                plus[k] += i;
                mustRemove -= i;
                chL -= i;
                lengths[k] -= i;
                rec();
              }
            };
            rec();
          }
        }
        lengths.forEach((length) => {
          if (length > 2) {
            steps += Math.trunc(length / 3);
            mustAdd -= Math.trunc(length / 3);
          }
        });
  
        mustRemove = mustRemove > 0 ? mustRemove : 0;
        mustAdd = mustAdd > 0 ? mustAdd : 0;
        steps += mustAdd + mustRemove;
        
      }

      setCount(steps)
      handleSavePassword(steps)
    }else {
      setCount(0);
    }


    
    
  }

  const handleSavePassword = async(steps) => {
    const params = {
      count:steps
    }

    axios.post('http://localhost:4000/api/password/createpassword' ,params)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  
  

  }

  const handleNumChange = (e) => {
    setNum(e.target.value)
    if(e.target.value === '') {
      setDiff('')
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>Password</h2>
        <div className="main">
          <input
            type="text"
            name="password"
            placeholder="password"
            onChange={e => handleChange(e)}
            value={password}
          />
          <button className="submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>
        <p>Output : {count}</p>

        <ul>
          {list && list.length > 0 && list.map((item,index) => {
            return <li key={index}>{item.count} </li>
          })}
        </ul>
      </header>
      <div>
        <h2>Absolute Minimal  Difference Checker</h2>
        <div className="sec">
          <p>please type 3,9,7,3 in textfield and then click on submit button</p>
        <input
            type="text"
            name="num"
            placeholder="num"
            onChange={e => handleNumChange(e)}
            value={num}
          />
          <button className="submit" onClick={() => handleDiffSubmit()}>
             Submit
          </button>
          
        </div>
        <p>Output : {diff}</p>
      </div>
    </div>
  );
}

export default App;

const express = require('express');
const axios = require('axios');
const lodash = require('lodash');

const app = express();
const port = 9876;
const win_size = 10;
const num_Window = [];

// Helper function to check if a number is prime
const isPrime = (num) => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
};


const isPerfectSquare = (x) => {
  let s = Math.sqrt(x);
  return (s * s === x);
};


const isFibonacci = (num) => {
  return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
};

const isEven = (num) => {
  return num % 2 === 0;
};


const fetchingNumbers = async (i) => {
  let fetch_url;
  switch (i) {
    case 'prime':
      fetch_url = 'http://20.244.56.144/test/primes';
      break;
    case 'fibo':
      fetch_url = 'http://20.244.56.144/test/fibo';
      break;
    case 'even':
      fetch_url = 'http://20.244.56.144/test/even';
      break;
    case 'rand':
      fetch_url = 'http://20.244.56.144/test/rand';
      break;
    default:
      throw new Error('Invalid');
  }

  try {
    const res = await axios.get(fetch_url, { timeout: 500 });
    return res.data.numbers;
  } catch (err) {
    console.error('Error fetching numbers:', err.message);
    return [];
  }
};


const cal_Avg = (i) => {
  if (i.length === 0) return 0;
  const sum = i.reduce((acc, num) => acc + num, 0);
  return (sum / i.length).toFixed(2);
};

app.get('/numbers/:numberid', async (req, res) => {
  const num_id = req.params.numberid;

  try {
    const new_Num = await fetchingNumbers(num_id);

    
    let filteredNumbers;
    switch (num_id) {
      case 'prime':
        filteredNumbers = new_Num.filter(isPrime);
        break;
      case 'fibo':
        filteredNumbers = new_Num.filter(isFibonacci);
        break;
      case 'even':
        filteredNumbers = new_Num.filter(isEven);
        break;
      case 'rand':
        filteredNumbers = new_Num; 
        break;
      default:
        filteredNumbers = [];
        break;
    }

    const unique_Num = lodash.uniq(filteredNumbers);

    const pre_win_state = [...num_Window];
    unique_Num.forEach((i) => {
      if (!num_Window.includes(i)) {
        num_Window.push(i);
      }
    });

    while (num_Window.length > win_size) {
      num_Window.shift();
    }

    const curr_Win_State = [...num_Window];
    const avg = cal_Avg(curr_Win_State);

    const response = {
      numbers: new_Num,
      windowPrevState: pre_win_state,
      windowCurrState: curr_Win_State,
      avg: avg,
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log('Server running at http://localhost:9876');
});

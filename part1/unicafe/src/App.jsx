import { useState } from 'react'

const Button = ({ label, handleClick }) => {
  return (
    <button onClick={handleClick}>{label}</button>
  )
}

const StatisticsLine = ({ label, stat }) => {
  return (
    <tr>
      <td>{label}</td>
      <td>{stat}</td>
    </tr>
  )
}

const Statistics = ({ good, neutral, bad, total, average, posPercent }) => {
  console.log(total)
  if (total !== 0) {
    return (
      <div>
        <StatisticsLine label={"good"} stat={good}/>
        <StatisticsLine label={"neutral"} stat={neutral}/>
        <StatisticsLine label={"bad"} stat={bad}/>
        <StatisticsLine label={"total"} stat={total}/>
        <StatisticsLine label={"average"} stat={average}/>
        <StatisticsLine label={"positive"} stat={posPercent + "%"}/>
      </div>
    )
  }

  return (
    <div>
      <p>No feedback given</p>
    </div>
  )
}

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)
  const [total, setTotal] = useState(0)
  const [average, setAverage] = useState(0)
  const [posPercent, setPosPercent] = useState(0)

  const calculateAverage = (currGood, currBad, currTotal) => {
    const newAverage = (currGood + (-currBad))/currTotal

    setAverage(newAverage)
  }

  const calculatePosPercent = (currGood, newTotal) => {
    const newPercent = (currGood / newTotal) * 100
    setPosPercent(newPercent)
  }

  const addToTotal = () => {
    const newTotal = total + 1
    setTotal(newTotal)
    return newTotal
  } 

  const handleGoodClick = () => {
    const newGood = good + 1
    setGood(newGood)
    const newTotal = addToTotal()
    calculateAverage(newGood, bad, newTotal)
    calculatePosPercent(newGood, newTotal)
  }

  const handleNeutralClick = () => {
    const newNeutral = neutral + 1
    setNeutral(newNeutral)
    const newTotal = addToTotal()
    calculateAverage(good, bad, newTotal)
    calculatePosPercent(good, newTotal)
  }

  const handleBadClick = () => {
    const newBad = bad + 1
    setBad(newBad)
    const newTotal = addToTotal()
    calculateAverage(good, newBad, newTotal)
    calculatePosPercent(good, newTotal)
  }

  return (
    <div>
      <h1>give feedback</h1>
      <Button label={"good"} handleClick={handleGoodClick}/>
      <Button label={"neutral"} handleClick={handleNeutralClick}/>
      <Button label={"bad"} handleClick={handleBadClick}/>
      <h1>statistics</h1>
      <Statistics 
        good={good} 
        neutral={neutral} 
        bad={bad} 
        total={total} 
        average={average} 
        posPercent={posPercent}
      />
    </div>
  )
}

export default App
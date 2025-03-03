import { useState } from 'react'

const Button = ({ label, handleClick }) => {
  return (
    <button onClick={handleClick}>{label}</button>
  )
}

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.',
    'The only way to go fast, is to go well.'
  ]
  const cleanBallot = { 
    0: 0, 
    1: 0, 
    2: 0, 
    3: 0, 
    4: 0, 
    5: 0, 
    6: 0, 
    7: 0 
  }
  const [votes, setVotes] = useState(cleanBallot)
  const [mostVotes, setMostVotes] = useState(0)
  const [selected, setSelected] = useState(0)

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getMostVotedIndex(voteCopy) {
    let greatest = 0;
    let key;

    for (let x in voteCopy) {
      if (voteCopy[x] > greatest) {
        key = x
        greatest = voteCopy[x]
      }
    }

    return key
  }

  const handleNextClick = () => {
    const index = getRandomInt(anecdotes.length-1)
    setSelected(index)
  }

  const handleVoteClick = () => {
    const voteCopy = { ...votes }
    voteCopy[selected] += 1
    setVotes(voteCopy)
    const winner = getMostVotedIndex(voteCopy)
    setMostVotes(winner)
  }

  return (
    <div>
      <div>
        <h1>Anecdote of the day</h1>
        {anecdotes[selected]}
        <p>has {votes[selected]} votes</p>
      </div>
      <div>
        <Button label={"vote"} handleClick={handleVoteClick}/>
        <Button label={"next anecdote"} handleClick={handleNextClick}/>
      </div>
      <div>
        <h1>Anecdote with the most votes</h1>
        {anecdotes[mostVotes]}
        <p>has {votes[mostVotes]} votes</p>
      </div>     
    </div>
  )
}

export default App
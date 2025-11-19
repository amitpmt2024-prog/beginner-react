import { useState } from 'react'

function TodoApp () {
  const [todos, setTodos] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('')

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setInputValue(e.target.value);
}

function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault(); // works only if button is in a <form>
  setTodos([...todos, inputValue]);
  setInputValue('');
}

function handleDelete(index:number){
  const newTodos = [...todos];
  newTodos.splice(index,1);
  setTodos(newTodos);
}
  return (
    <div>
      <h1>Todo List</h1>
      <form>
        <input type='text' value={inputValue} onChange={handleChange}/>
        <button onClick={handleSubmit}>Add Todo</button>
      </form>
      <ul>
        {todos.map((todo,index) => (
          <li key={index}>{todo}
           <button onClick={() => handleDelete(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TodoApp;
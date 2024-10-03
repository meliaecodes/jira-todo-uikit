import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Button, Checkbox, DynamicTable, Form, Inline,  Lozenge, Textfield } from '@forge/react';
import { invoke } from '@forge/bridge';
import { handler } from '../resolvers';

const App = () => {
  const [todo, setTodo] = useState(null);
  const [todoRows, setTodoRows] = useState(null);
  const [lozenge, setLozenge] = useState(null);

  useEffect(() => {
    invoke('get-all').then(setTodo);
  }, []);
  
  const doneLozenge = ( item ) => {
    if (item.done) {
      return (<Lozenge appearance="success">Done</Lozenge>);
    } else {
      return "";
    }
  }

  const addNewTodo = (data) => {
    if(data !== "") {
      setTodo([...todo, data])}
      else {
        console.log("new todo was blank")
      }
  }

  const create = (data) => {
    invoke('create', {data}).then(addNewTodo);
  }

  const remove = (data) => {
    setTodo(todo.filter(t => t.id !== data.id));
  }

  const update = (data) => {
    if(data !== "") {
      setTodo(todo.map(t => {if(t.id === data.id) {return data} else {return t}}));
    }
  }

  const fillTable = ( todos ) => {
    const lastRow = ({
      cells: [
       {
         colspan: 1,
         content: "",
       },
        {
          colspan: 10,
          content: <Textfield appearance="subtle"  spacing="compact" id="todo-input" placeholder="Add a todo +" onBlur={create}/>,
        },
        {
         colspan: 2,
         content: "",
         },
        {
          colspan: 1,
          content: ""
          },
      ],
     })
    if (todos.length > 0) {
      const rows = todos.map((item) => ({
       cells: [
         {
           colspan: 1,
           content: <Checkbox onChange={(event) => invoke('update', {item, event}).then(update)} defaultChecked={item.done}/>,
         },
         {
           colspan: 10,
           content: <Textfield appearance="subtle"  spacing="compact" defaultValue={item.title} onBlur={(event) => invoke('update', {item, event})}/>,
         },
         {
           colspan: 2, 
           content: doneLozenge(item),
         },
         {
           colspan: 1,
           content: <Button appearance="subtle" iconBefore="cross-circle" onClick={() => invoke('delete', {item}).then(remove)} spacing="compact"/>,
         },
       ],
     }))
     rows.push(lastRow)
     return rows;
    } else { 
      return [lastRow];  
    }
  }

  useEffect(() => {
    if (todo) {
      setTodoRows(fillTable(todo));
      const completedCount = todo.filter(t => t.done).length;
      const totalCount = todo.length;
      const text = completedCount + " / " + totalCount + " Completed";
      if(completedCount === totalCount) {
        setLozenge(<Lozenge appearance="success">{text}</Lozenge>);
      } else {
        setLozenge(<Lozenge>{text}</Lozenge>); 
      }
    } else {
      setTodo([])
    }
  }, [todo]);

  return (
    <>
      <DynamicTable 
        caption="Todos"
        rows={todoRows ? todoRows : []} />
      <Inline spread='space-between'>
        {lozenge}
        <Button onClick={() => invoke('delete-all').then(setTodo)}>Delete All</Button>
      </Inline>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

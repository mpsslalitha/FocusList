import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TodoList.css'; // Import the CSS styles
import EditTodo from './EditTodo'; // Import the Modal component

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [editingTodo, setEditingTodo] = useState(null);
    const [editedTodo, setEditedTodo] = useState(""); // Renamed to match backend field
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const response = await axios.get('http://localhost:8090/api/todos/');
            console.log('Fetched todos:', response.data);
            setTodos(response.data);
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    };

    const addTodo = async () => {
        if (!newTodo) return;
        try {
            const response = await axios.post('http://localhost:8090/api/todos/', { todo: newTodo, completed: false });
            setTodos([...todos, response.data]);
            setNewTodo("");
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const toggleComplete = async (todo) => {
        try {
            const updatedTodo = { ...todo, completed: !todo.completed };
            await axios.put(`http://localhost:8090/api/todos/${todo.id}`, updatedTodo);
            setTodos(todos.map(t => (t.id === todo.id ? updatedTodo : t)));
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const startEditing = (todo) => {
        setEditingTodo(todo);
        setEditedTodo(todo.todo); // Changed to match the backend field
        setIsModalOpen(true); // Open the modal for editing
    };

    const updateTodo = async () => {
        if (!editedTodo) return;
        try {
            const updatedTodo = { ...editingTodo, todo: editedTodo }; // Changed to match the backend field
            await axios.put(`http://localhost:8090/api/todos/${editingTodo.id}`, updatedTodo);
            setTodos(todos.map(t => (t.id === editingTodo.id ? updatedTodo : t)));
            setIsModalOpen(false); // Close the modal after updating
            setEditingTodo(null);
            setEditedTodo(""); // Reset the editedTodo
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const deleteTodo = async (todoId) => {
        try {
            await axios.delete(`http://localhost:8090/api/todos/${todoId}`);
            setTodos(todos.filter(todo => todo.id !== todoId));
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    // Format date to dd-mm-yyyy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Group todos by their created date
    const groupTodosByDate = (todos) => {
    // First, group todos by date
    const grouped = todos.reduce((groups, todo) => {
        const date = todo.createdDate ? formatDate(todo.createdDate) : 'Unknown Date'; // Format date
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(todo);
        return groups;
    }, {});

    // Sort the dates in descending order (most recent first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
        const dateA = new Date(a.split('-').reverse().join('-')); // Convert dd-mm-yyyy to yyyy-mm-dd
        const dateB = new Date(b.split('-').reverse().join('-')); // Convert dd-mm-yyyy to yyyy-mm-dd
        return dateB - dateA; // Sort in descending order
    });

    // Return the sorted grouped todos
    const sortedGroupedTodos = {};
    sortedDates.forEach(date => {
        sortedGroupedTodos[date] = grouped[date];
    });

    return sortedGroupedTodos;
};


    const groupedTodos = groupTodosByDate(todos);

    return (
        <div className="container">
            <h1>FocusList</h1>
            <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add new "
            />
            <button onClick={addTodo} className='add-todo'>Add</button>

            <EditTodo 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)} 
                onSubmit={updateTodo} 
                todo={editedTodo} // Updated to use 'todo'
                setTodo={setEditedTodo} // Updated to use 'setTodo'
            />

            {Object.keys(groupedTodos).length > 0 ? (
                Object.keys(groupedTodos).map(date => (
                    <div key={date} className="date-group">
                        {/* Display the formatted date */}
                        <h2 className="date-header">{date}</h2>
                        <div className="todo-list-group">
                            <ul>
                                {groupedTodos[date].map(todo => (
                                    <li key={todo.id} className="todo-item">
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => toggleComplete(todo)}
                                        />
                                        <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                                            {todo.todo} {/* Changed to 'todo' */}
                                        </span>
                                        <button className="button edit" onClick={() => startEditing(todo)}>Edit</button>
                                        <button className="button delete" onClick={() => deleteTodo(todo.id)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))
            ) : (
                <div>No todos available</div>
            )}
        </div>
    );
};

export default TodoList;

import React from 'react';
import './EditTodo.css'; // Create a CSS file for the modal styles

const EditTodo = ({ isOpen, onClose, onSubmit, todo, setTodo }) => {
    if (!isOpen) return null; // Don't render anything if the modal isn't open

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Todo</h2>
                <input
                    type="text"
                    value={todo} // Change to 'todo' to match the prop passed from the parent
                    onChange={(e) => setTodo(e.target.value)} // Change to 'setTodo' to match the prop passed from the parent
                    placeholder="Edit your todo"
                />
                <div className="modal-buttons">
                    <button onClick={onSubmit} className="update-todo">Update</button>
                    <button onClick={onClose} className="close-modal">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default EditTodo;

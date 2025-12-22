'use client'
import React, { useState, useEffect, useRef } from 'react';

const Addtask = () => {

  const [title, settitle] = useState('');
  const [description, setdescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [MainTask, setMainTask] = useState([]);
  const [completedTask, setCompletedTask] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  const editTitleRef = useRef(null);

  const submitHandler = (e) => {
    e.preventDefault();
    if (title.trim() === '') return;

    const newTask = {
      title,
      description,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    setMainTask([...MainTask, newTask]);
    settitle('');
    setdescription('');
    setDeadline('');
  };

  const deleteHandler = (i) => {
    let copytask = [...MainTask];
    copytask.splice(i, 1);
    setMainTask(copytask);
  };

  const completeTask = (i) => {
    let copyTask = [...MainTask];
    let taskToComplete = copyTask.splice(i, 1)[0];
    taskToComplete.completedAt = new Date().toISOString();
    setMainTask(copyTask);
    setCompletedTask([...completedTask, taskToComplete]);
  };

  const undoTask = (i) => {
    let copyCompleted = [...completedTask];
    let taskToUndo = copyCompleted.splice(i, 1)[0];
    taskToUndo.completedAt = null;
    setCompletedTask(copyCompleted);
    setMainTask([...MainTask, taskToUndo]);
  };

  const startEdit = (i) => {
    setEditingTask(i);
    setEditTitle(MainTask[i].title);
    setEditDescription(MainTask[i].description);
    setEditDeadline(MainTask[i].deadline ?
      new Date(MainTask[i].deadline).toISOString().slice(0, 16) : '');

    setTimeout(() => {
      if (editTitleRef.current) {
        editTitleRef.current.focus();
      }
    }, 0);
  };

  const saveEdit = (i) => {
    if (editTitle.trim() === '') return;

    let copyTask = [...MainTask];
    copyTask[i] = {
      ...copyTask[i],
      title: editTitle,
      description: editDescription,
      deadline: editDeadline ? new Date(editDeadline).toISOString() : null
    };
    setMainTask(copyTask);
    setEditingTask(null);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
    setEditDeadline('');
  };

  const handleKeyPress = (e, i) => {
    if (e.key === 'Enter') {
      saveEdit(i);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Task statistics
  const totalTasks = MainTask.length + completedTask.length;
  const completedCount = completedTask.length;
  const remainingCount = MainTask.length;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Countdown component
  const CountdownTimer = ({ deadline }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
      if (!deadline) return;

      const timer = setInterval(() => {
        const now = new Date().getTime();
        const deadlineTime = new Date(deadline).getTime();
        const distance = deadlineTime - now;

        if (distance < 0) {
          setIsOverdue(true);
          const overdue = Math.abs(distance);
          const days = Math.floor(overdue / (1000 * 60 * 60 * 24));
          const hours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            setTimeLeft(`Overdue by ${days}d ${hours}h ${minutes}m`);
          } else if (hours > 0) {
            setTimeLeft(`Overdue by ${hours}h ${minutes}m`);
          } else {
            setTimeLeft(`Overdue by ${minutes}m`);
          }
        } else {
          setIsOverdue(false);
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m`);
          } else if (minutes > 0) {
            setTimeLeft(`${minutes}m ${seconds}s`);
          } else {
            setTimeLeft(`${seconds}s`);
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [deadline]);

    if (!deadline) return null;

    return (
      <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
        {timeLeft}
      </div>
    );
  };

  let taskRunner = <h2 className='text-center text-gray-500'>Task list is empty</h2>;

  if (MainTask.length > 0) {
    taskRunner = MainTask.map((t, i) => {
      return (
        <div key={i} className='border border-gray-200 rounded-lg p-4 mb-3 bg-white shadow-sm hover:shadow-md transition-shadow'>
          {editingTask === i ? (
            // Edit mode
            <div className='space-y-3'>
              <input
                ref={editTitleRef}
                type='text'
                className='w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, i)}
                placeholder='Task title'
              />
              <textarea
                className='w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, i)}
                placeholder='Task description'
                rows={2}
              />
              <input
                type='datetime-local'
                className='border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
              <div className='flex gap-2'>
                <button
                  onClick={() => saveEdit(i)}
                  className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors'
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className='bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors'
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex-1'>
                  <h4 className='font-semibold text-gray-900 text-lg mb-1'>{t.title}</h4>
                  {t.description && <p className='text-gray-600 text-sm mb-2'>{t.description}</p>}

                  <div className='flex flex-wrap gap-4 text-xs text-gray-500 mb-2'>
                    <span>Created: {formatDate(t.createdAt)}</span>
                    <span>({formatRelativeTime(t.createdAt)})</span>
                    {t.deadline && (
                      <span>Due: {formatDate(t.deadline)}</span>
                    )}
                  </div>

                  {t.deadline && <CountdownTimer deadline={t.deadline} />}
                </div>

                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => startEdit(i)}
                    className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => completeTask(i)}
                    className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors'
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => deleteHandler(i)}
                    className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Task Dashboard */}
      <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-6'>
        <h1 className='text-3xl font-bold mb-4 text-center'>Task Manager Dashboard</h1>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white bg-opacity-20 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-gray-900'>{totalTasks}</div>
            <div className='text-xl text-gray-700 '>Total Tasks</div>
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-green-500'>{completedCount}</div>
            <div className='text-xl  text-green-400'>Completed</div>
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-amber-400'>{remainingCount}</div>
            <div className='text-xl text-amber-300'>Remaining</div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className='bg-white p-6 rounded-xl shadow-lg mb-6'>
        <h2 className='text-xl font-semibold mb-4 text-gray-800'>Add New Task</h2>
        <form onSubmit={submitHandler} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <input
              type='text'
              className=' text-gray-900 border border-gray-300  rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Task title'
              value={title}
              onChange={(e) => settitle(e.target.value)}
              required
            />
            <input
              type='datetime-local'
              className=' text-gray-600 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              title='Deadline (optional)'
            />
          </div>
          <textarea
            className='w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='Task description (optional)'
            value={description}
            onChange={(e) => setdescription(e.target.value)}
            rows={3}
          />
          <button
            type='submit'
            className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors'
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Completed Tasks Section */}
      {completedTask.length > 0 && (
        <div className='bg-green-50 border border-green-200 p-6 rounded-xl shadow-lg mb-6'>
          <h2 className='text-green-800 font-bold text-2xl mb-4 flex items-center'>
            <span className='mr-2'>✅</span>
            Completed Tasks ({completedCount})
          </h2>
          <div className='space-y-3'>
            {completedTask.map((t, i) => (
              <div key={i} className='bg-white border border-green-200 rounded-lg p-4 flex items-center justify-between'>
                <div className='flex-1'>
                  <h4 className='font-medium text-black line-through'>{t.title}</h4>
                  {t.description && <p className='text-black text-sm line-through'>{t.description}</p>}
                  <div className='flex flex-wrap gap-4 text-xs text-black mt-1'>
                    <span>Created: {formatDate(t.createdAt)}</span>
                    <span>Completed: {formatDate(t.completedAt)}</span>
                    {t.deadline && <span>Was due: {formatDate(t.deadline)}</span>}
                  </div>
                </div>
                <button
                  onClick={() => undoTask(i)}
                  className='bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors ml-4'
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Tasks Section */}
      <div className='bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-lg'>
        <h2 className='text-blue-800 font-bold text-2xl mb-4 flex items-center'>
          <span className='mr-2'>📋</span>
          Active Tasks ({remainingCount})
        </h2>
        <div>{taskRunner}</div>
      </div>
    </div>
  );
};

export default Addtask;
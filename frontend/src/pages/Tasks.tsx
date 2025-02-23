import React, { useState, useEffect } from 'react'
import { taskService } from '../services/api'

interface Task {
    id: number
    title: string
    description?: string
    is_complete: boolean
    user_id: number
    created_at: string
}

type Styles = {
  [key: string]: React.CSSProperties}

const Tasks: React.FC<{ authToken: string }> = ({ authToken }) => {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDescription, setNewTaskDescription] = useState('')
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
    const [editedTaskTitle, setEditedTaskTitle] = useState('')
    const [editedTaskDescription, setEditedTaskDescription] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTasks = async () => {
        try {
            console.log('Fetching tasks...');
            const fetchedTasks = await taskService.getTasks(authToken)
            console.log('Fetched tasks:', fetchedTasks);
            setTasks(fetchedTasks)
            setIsLoading(false)
        } catch (error: any) {
            console.error('Error fetching tasks:', error)
            setError(error.message)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (authToken) fetchTasks()
    }, [authToken])

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return

        try {
            console.log('Creating task:', { title: newTaskTitle, description: newTaskDescription })
            const response = await taskService.createTask(authToken, {
                title: newTaskTitle,
                description: newTaskDescription,
            });
            console.log('Created task:', response);
            
            // Extract the task from the response
            const createdTask = response.task;
            setTasks((prevTasks) => [...prevTasks, createdTask]);
            setNewTaskTitle('');
            setNewTaskDescription('');
        } catch (error: any) {
            console.error('Error adding task:', error);
            setError(error.message);
        }
    }

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id)
        setEditedTaskTitle(task.title)
        setEditedTaskDescription(task.description || '')
    }

    const handleUpdateTask = async (taskId: number) => {
        if (!editedTaskTitle.trim()) return;

        try {
            console.log('Updating task:', taskId, {
                title: editedTaskTitle,
                description: editedTaskDescription
              })

            const updatedTask = await taskService.updateTask(authToken, taskId.toString(), {
              title: editedTaskTitle,
              description: editedTaskDescription,
            })

            console.log('Task updated:', updatedTask);

            setTasks((prevTasks) =>
                prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
            );
            setEditingTaskId(null);
            setEditedTaskTitle('');
            setEditedTaskDescription('');
        } catch (error) {
            console.error('Error updating task:', error);
            // Optionally show error to user
        }
    };

    const toggleTaskCompletion = async (taskId: number, is_complete: boolean) => {
        try {
            const updatedTask = await taskService.updateTask(authToken, taskId.toString(), {
                is_complete: !is_complete
            });
            setTasks(prevTasks =>
                prevTasks.map(task => task.id === taskId ? updatedTask : task)
            );
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    }

    const handleDeleteTask = async (taskId: number) => {
        try {
            await taskService.deleteTask(authToken, taskId.toString())
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
        } catch (error) {
            console.error('Error deleting task:', error)
        }
    }

    if (isLoading) {
      return <div style={styles.loading}>Loading tasks...</div>;
  }

  if (error) {
      return <div style={styles.error}>Error: {error}</div>;
  }
    return (
      <div style={styles.container}>
          <h1 style={styles.heading}>Tasks</h1>
          <div style={styles.taskList}>
              {tasks.map((task) => (
                  <div key={task.id} style={styles.taskItem}>
                      {editingTaskId === task.id ? (
                          // Edit mode
                          <div style={styles.editForm}>
                              <input
                                  type="text"
                                  value={editedTaskTitle}
                                  onChange={(e) => setEditedTaskTitle(e.target.value)}
                                  style={styles.input}
                              />
                              <textarea
                                  value={editedTaskDescription}
                                  onChange={(e) => setEditedTaskDescription(e.target.value)}
                                  style={styles.textarea}
                              />
                              <div style={styles.buttonGroup}>
                                  <button
                                      onClick={() => handleUpdateTask(task.id)}
                                      style={styles.button}
                                  >
                                      Save
                                  </button>
                                  <button
                                      onClick={() => setEditingTaskId(null)}
                                      style={styles.button}
                                  >
                                      Cancel
                                  </button>
                              </div>
                          </div>
                      ) : (
                          // View mode
                          <div style={styles.taskContent}>
                              <input
                                  type="checkbox"
                                  checked={task.is_complete}
                                  onChange={() => toggleTaskCompletion(task.id, task.is_complete)}
                                  style={styles.checkbox}
                              />
                              <div style={styles.taskDetails}>
                                  <h3 style={styles.taskTitle}>{task.title}</h3>
                                  <p style={styles.taskDescription}>{task.description}</p>
                              </div>
                              <div style={styles.buttonGroup}>
                                  <button
                                      onClick={() => startEditing(task)}
                                      style={styles.button}
                                  >
                                      Edit
                                  </button>
                                  <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      style={styles.button}
                                  >
                                      Delete
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              ))}
          </div>
          <div style={styles.addTaskForm}>
              <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  style={styles.input}
              />
              <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                  style={styles.textarea}
              />
              <button onClick={handleAddTask} style={styles.button}>
                  Add Task
              </button>
          </div>
      </div>
  )
}

const styles: Styles = {
  container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
  },
  heading: {
      textAlign: 'center' as const,
      color: '#333',
  },
  taskList: {
      marginTop: '20px',
  },
  taskItem: {
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '10px',
      marginBottom: '10px',
      backgroundColor: '#f9f9f9',
  },
  taskContent: {
      display: 'flex',
      alignItems: 'center',
  },
  taskDetails: {
      flex: 1,
      marginLeft: '10px',
  },
  taskTitle: {
      margin: '0',
      color: '#333',
  },
  taskDescription: {
      margin: '5px 0',
      color: '#666',
  },
  editForm: {
      display: 'flex',
      flexDirection: 'column',
  },
  input: {
      padding: '8px',
      marginBottom: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
  },
  textarea: {
      padding: '8px',
      marginBottom: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      resize: 'vertical',
  },
  buttonGroup: {
      display: 'flex',
      gap: '10px',
  },
  button: {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
  },
  checkbox: {
      marginRight: '10px',
  },
  addTaskForm: {
      marginTop: '20px',
  },
  loading: {
      textAlign: 'center' as const,
      fontSize: '18px',
      color: '#333',
  },
  error: {
      textAlign: 'center' as const,
      fontSize: '18px',
      color: 'red',
  },
};

export default Tasks;

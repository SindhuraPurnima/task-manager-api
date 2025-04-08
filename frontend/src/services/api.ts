// Types
interface Task {
    id: number;
    title: string;
    description?: string;
    is_complete: boolean;
    user_id: number;
    created_at: string;
}

interface TaskResponse {
    message: string;
    task: Task;
}

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, use relative path
  : 'http://localhost:3000/api'; // In development, use full URL

// Helper function to handle fetch responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'An error occurred')
    }
    return response.json();
};

// Create headers with authentication token
const createHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
})

export const taskService = {
    async getTasks(token: string): Promise<Task[]> {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        return response.json();
    },

    async createTask(token: string, task: { title: string; description?: string }): Promise<TaskResponse> {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        if (!response.ok) {
            throw new Error('Failed to create task');
        }
        return response.json();
    },

    async updateTask(token: string, taskId: string, updates: Partial<Task>): Promise<Task> {
        // Only include fields that have values
        const updatedData: Partial<Task> = {};
        
        if (updates.title !== undefined) {
            updatedData.title = updates.title;
        }
        if (updates.description !== undefined) {
            updatedData.description = updates.description;
        }
        if (updates.is_complete !== undefined) {
            updatedData.is_complete = updates.is_complete;
        }

        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.error || responseData.details || 'Failed to update task');
            }

            return responseData;
        } catch (error: any) {
            console.error('Update task error:', error.message);
            throw error;
        }
    },

    async deleteTask(token: string, taskId: string): Promise<void> {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
    }
}
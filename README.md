# Task Tracker
A simple command-line inerface to track and manage your tasks.

## Installation & Setup
```Bash
git clone https://github.com/2JustFox2/Task-Tracker
cd task-tracker-cli
```

## Usage
Run the commands using `node index.js` (or `npm link` to use `task-cli`)

### Adding a task
```Bash
node index.js add "Buy groceries"
# Output: Task added successfully (ID: 1)
```

### Updating a task
```Bash
node index.js update 1 "Buy groceries and cook dinner"
# Output: Task updated successfully (ID: 1)
```

### Updating task status
```Bash
node index.js mark-in-progress 1
# Output: Task mark as in-progress successfully (ID: 1)

node index.js mark-done 1
# Output: Task mark as done successfully (ID: 1)
```

### Listing tasks
```Bash
node index.js list

# Filter by status
node index.js list todo
node index.js list in-progress
node index.js list done
```

### Deleting a Task
```Bash
node index.js delete 1
# Output: Task deleted successfully (ID: 1)
```

### Help
```Bash
node index.js help
```
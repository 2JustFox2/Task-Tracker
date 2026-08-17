#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const FILE_PATH = path.resolve('tasks.json');
const args = process.argv.slice(2);

const commands = {
  'help': { f: help, desc: 'Display help information', help: 'help', minArgs: 0, maxArgs: 0 },
  'add': { f: add, desc: 'Add a new task', help: 'add [name]', minArgs: 1, maxArgs: 1 },
  'update': { f: update, desc: 'Update an existing task', help: 'update [id] [name]', minArgs: 2, maxArgs: 2 },
  'list': { f: list, desc: 'List all tasks (done, todo, in-progress)', help: 'list [done|todo|in-progress]', minArgs: 0, maxArgs: 1 },
  'mark-in-progress': { f: (args) => setStatus(args, 'in-progress'), desc: 'Mark a task as in progress', help: 'mark-in-progress [id]', minArgs: 1, maxArgs: 1 },
  'mark-done': { f: (args) => setStatus(args, 'done'), desc: 'Mark a task as done', help: 'mark-done [id]', minArgs: 1, maxArgs: 1 },
  'delete': { f: deleteTask, desc: 'Delete a task', help: 'delete [id]', minArgs: 1, maxArgs: 1 },
};

// Working with storage

function loadTasks() {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify([]), 'utf8');
      return [];
    }
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading database file:', err.message);
    process.exit(1);
  }
}

function saveTasks(tasks) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving database file:', err.message);
    process.exit(1);
  }
}

// Commands

function help() {
  console.log('Available commands:');
  for (const [name, { desc }] of Object.entries(commands)) {
    console.log(`  ${name.padEnd(18)} : ${desc}`);
  }
}

function add([, name]) {
  const tasks = loadTasks();
  const nextId = tasks.reduce((max, t) => Math.max(max, t.id || 0), 0) + 1;

  tasks.push({
    id: nextId,
    name,
    mark: 'todo',
    createdAt: new Date().toISOString(),
  });

  saveTasks(tasks);
  console.log(`Task added successfully (ID: ${nextId})`);
}

function update([, idStr, newName]) {
  const id = Number(idStr);
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    console.error(`Task with ID ${id} not found.`);
    process.exit(1);
    return;
  }

  task.name = newName;
  task.updatedAt = new Date().toISOString();

  saveTasks(tasks);
  console.log(`Task updated successfully (ID: ${id})`);
}

function setStatus([, idStr], status) {
  const id = Number(idStr);
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    console.error(`Task with ID ${id} not found.`);
    process.exit(1);
    return;
  }

  task.mark = status;
  task.updatedAt = new Date().toISOString();

  saveTasks(tasks);
  console.log(`Task mark as ${status} successfully (ID: ${id})`);
}

function deleteTask([, idStr]) {
  const id = Number(idStr);
  const tasks = loadTasks();
  const initialLength = tasks.length;
  const filtered = tasks.filter((t) => t.id !== id);

  if (filtered.length === initialLength) {
    console.error(`Task with ID ${id} not found.`);
    process.exit(1);
    return;
  }

  saveTasks(filtered);
  console.log(`Task deleted successfully (ID: ${id})`);
}

function list([, statusFilter]) {
  const tasks = loadTasks();
  const filtered = statusFilter
    ? tasks.filter((t) => t.mark === statusFilter.toLowerCase())
    : tasks;

  if (filtered.length === 0) {
    console.log('No tasks found.');
    process.exit(1);
    return;
  }

  for (const task of filtered) {
    console.log(`[${task.id}] ${task.name} - ${task.mark}`);
  }
}

// Argument routing

const [commandName, ...commandArgs] = args;

if (!commandName || !(commandName in commands)) {
  if (commandName) console.log(`Unknown command: ${commandName}`);
  help();
  process.exit(1);
}

const command = commands[commandName];
const argCount = commandArgs.length;

if (argCount < command.minArgs || argCount > command.maxArgs) {
  console.log('Invalid input format');
  console.log(`Usage: task-cli ${command.help}`);
  process.exit(1);
}

command.f(args);
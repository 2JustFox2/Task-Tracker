import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

// Specify the name/path to your CLI script
const CLI_PATH = path.resolve('./index.js');
const DB_FILE = path.resolve('./tasks.json');

function runCli(args = '') {
    try {
        return execSync(`node "${CLI_PATH}" ${args}`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
    } catch (error) {
        return (error.stdout || error.stderr || error.message).trim();
    }
}

describe('Task CLI Tests', () => {
    beforeEach(() => {
        if (fs.existsSync(DB_FILE)) {
            fs.unlinkSync(DB_FILE);
        }
    });

    afterEach(() => {
        if (fs.existsSync(DB_FILE)) {
            fs.unlinkSync(DB_FILE);
        }
    });

    it('add: should successfully add a task and assign an auto-incrementing ID', () => {
        const output1 = runCli('add "Buy groceries"');
        assert.equal(output1, 'Task added successfully (ID: 1)');

        const output2 = runCli('add "Cook dinner"');
        assert.equal(output2, 'Task added successfully (ID: 2)');

        const listOutput = runCli('list');
        assert.equal(
            listOutput,
            ['[1] Buy groceries - todo', '[2] Cook dinner - todo'].join('\n'),
        );
    });

    it('update: should update the task text by ID', () => {
        runCli('add "Buy groceries"');
        const updateOutput = runCli('update 1 "Buy groceries and cook dinner"');
        assert.equal(updateOutput, 'Task updated successfully (ID: 1)');

        const listOutput = runCli('list');
        assert.equal(listOutput, '[1] Buy groceries and cook dinner - todo');
    });

    it('mark-in-progress and mark-done: should change task statuses', () => {
        runCli('add "Buy groceries"');

        // Check mark-in-progress
        const inProgressOutput = runCli('mark-in-progress 1');
        assert.equal(
            inProgressOutput,
            'Task mark as in-progress successfully (ID: 1)',
        );
        assert.equal(
            runCli('list in-progress'),
            '[1] Buy groceries - in-progress',
        );

        // Check mark-done
        const doneOutput = runCli('mark-done 1');
        assert.equal(doneOutput, 'Task mark as done successfully (ID: 1)');
        assert.equal(runCli('list done'), '[1] Buy groceries - done');
    });

    it('delete: should correctly delete the task without shifting the remaining IDs', () => {
        runCli('add "Task 1"'); //ID: 1
        runCli('add "Task 2"'); // ID: 2
        runCli('add "Task 3"'); // ID: 3

        // Delete the second task
        const deleteOutput = runCli('delete 2');
        assert.equal(deleteOutput, 'Task deleted successfully (ID: 2)');

        // Check that IDs 1 and 3 are preserved
        const listOutput = runCli('list');
        assert.equal(
            listOutput,
            ['[1] Task 1 - todo', '[3] Task 3 - todo'].join('\n'),
        );

        // The newly added task should receive ID 4 (not 3)
        const addOutput = runCli('add "Task 4"');
        assert.equal(addOutput, 'Task added successfully (ID: 4)');
    });

    it('list: should filter by status and return a message if the list is empty', () => {
        // Check for an empty list
        assert.equal(runCli('list'), 'No tasks found.');

        runCli('add "Task 1"');
        runCli('add "Task 2"');
        runCli('add "Task 3"');

        runCli('mark-in-progress 2');
        runCli('mark-done 3');

        // Filter by todo
        assert.equal(runCli('list todo'), '[1] Task 1 - todo');

        // Filter by in-progress
        assert.equal(runCli('list in-progress'), '[2] Task 2 - in-progress');

        // Filter by done
        assert.equal(runCli('list done'), '[3] Task 3 - done');
    });

    it('errors: must correctly handle non-existent IDs and invalid arguments', () => {
        // Attempt to update a non-existent task
        const updateNonExistent = runCli('update 999 "New name"');
        assert.match(updateNonExistent, /Task with ID 999 not found/);

        // Not enough arguments
        const notEnoughArgs = runCli('add');
        assert.match(notEnoughArgs, /Invalid input format/);

        // Extra arguments
        const tooManyArgs = runCli('delete 1 extra_arg');
        assert.match(tooManyArgs, /Invalid input format/);

        // Unknown command
        const unknownCmd = runCli('random_command');
        assert.match(unknownCmd, /Unknown command: random_command/);
    });
});

import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { AttachmentUtil } from '.././helpers/attachmentUtils'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todosAcess = new TodosAccess()
const attachmentUtil = new AttachmentUtil()
const logger = createLogger('todos')

export async function getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`getTodos: ${userId}` , {
        key: userId
    })
    const result = todosAcess.getTodos(userId)
    logger.info(`getTodos: success`, {
        key: userId
    })
    return result
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info(`createTodo: ${createTodoRequest}`, {
        key: userId
    })
    const todoId = uuid.v4()

    const newTodo: TodoItem = {
        todoId: todoId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    }

    const result = await todosAcess.createTodo(newTodo)
    logger.info(`createTodo: successfully`, {
        key: userId,
        newTodo: newTodo
    })
    return result
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string) {
    logger.info(`updateTodoRequest: ${updateTodoRequest}`, {
        key: userId
    })
    const updateTodo: TodoItem = {
        todoId: todoId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
        attachmentUrl: null
    }

    await todosAcess.updateTodo(updateTodo, userId, todoId);
    logger.info(`updateTodo: success`, {
        key: userId,
        updateTodo: updateTodo
    })
}

export async function deleteTodo(userId: string, todoId: string) {
    logger.info(`deleteTodo: ${todoId}`, {
        key: userId
    })
    await todosAcess.deleteTodo(userId, todoId)
    logger.info(`deleteTodo: success`, {
        key: userId
    })
}

export async function generateUploadUrl(todoId: string, userId: string) {
    const result = await attachmentUtil.generateUploadUrl(todoId, userId);

    logger.info(`generateUploadUrl: success`, {
        key: userId
    })
    return result
  }



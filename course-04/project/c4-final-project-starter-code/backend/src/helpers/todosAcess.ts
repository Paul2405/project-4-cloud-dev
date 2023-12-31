import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Get list todo: ${userId}`)
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Create todo:  ${todo.todoId}`)
        await this.docClient.put({
          TableName: this.todosTable,
          Item: todo
        }).promise()
    
        return todo
    }

    async updateTodo(todo: TodoUpdate, userId: string, todoId: string) {
        logger.info(`Update todo by id: ${todoId}`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'set #nameTodo = :name, dueDate = :dueDate, done = :done',
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':name': todo.name,
                ':dueDate': todo.dueDate,
                ':done': todo.done
            },
            ExpressionAttributeNames: {
                '#nameTodo': 'name'
            }
        }).promise()
    }

    async deleteTodo(userId: string, todoId: string) {
        logger.info(`Delete todo by id: ${todoId}`)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise()
    }
}

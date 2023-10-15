//const AWS = require('aws-sdk');
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
const db = new DynamoDBClient({
  region: process.env.IS_OFFLINE ? 'localhost' : undefined, // Adjust region
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined, // Adjust endpoint
});

//const db = new AWS.DynamoDB.DocumentClient(dbClientParams);

export const update_user = async event => {
  // Parse the request body to extract the user data to update
  const requestBody = JSON.parse(event.body);
  const userId = event.pathParameters.id; // The 'id' must be part of the path

  // Create an update expression for DynamoDB.
  const updateExpression = [];
  const expressionAttributeValues = {};

  try {
    for (const key in requestBody) {
      if (key !== 'id') {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = requestBody[key];
        expressionAttributeValues[`#${key}`] = key;
      }
    }

    // Build the update parameters
    const params = {
      TableName: 'usersTable',
      Key: { pk: { S: userId } }, // Replace with your partition key value
      UpdateExpression: 'SET #name = :name , #id = :id, #email= :email',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#id': 'id',
        '#email': 'email',
      },
      ExpressionAttributeValues: {
        ':name': { S: requestBody.name },
        ':id': { S: requestBody.id.toString() },
        ':email': { S: requestBody.email },
      },
      KeyConditionExpression: 'pk = :pk',
      ReturnValues: 'ALL_NEW',
    };

    // Perform the update operation
    const response = await db.send(new UpdateItemCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(response.Attributes),
    };
  } catch (error) {
    console.error('Error updating user:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

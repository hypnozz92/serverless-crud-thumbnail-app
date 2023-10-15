import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'crypto';

const dynamodbClient = new DynamoDBClient({
  region: process.env.IS_OFFLINE ? 'localhost' : undefined, // Adjust region
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined, // Adjust endpoint
});

export const post_user = async event => {
  try {
    // Parse the request body to extract the user data
    const requestBody = JSON.parse(event.body);

    console.log(requestBody.id);

    //I am doing the validation in API Gateway******************************

    // Validate the request body to ensure it contains the required data
    // if (!requestBody.id || !requestBody.name) {
    //   return {
    //     statusCode: 400, // Bad Request
    //     body: JSON.stringify({ message: 'Name and ID are required fields' }),
    //   };
    // }

    // Check if the id and name attributes are strings
    // if (
    //   typeof requestBody.id !== 'string' ||
    //   typeof requestBody.name !== 'string'
    // ) {
    //   return {
    //     statusCode: 400, // Bad Request
    //     body: JSON.stringify({ message: 'id and name must be strings' }),
    //   };
    // }

    // Create a new user item
    const userItem = {
      pk: { S: randomUUID() },
      id: { S: requestBody.id }, // Assuming 'I' for Integer data type
      name: { S: requestBody.name }, // Assuming 'S' for string data type
      email: { S: requestBody.email },
    };

    console.log(typeof userItem.pk);
    console.log(userItem);

    // Create an instance of the PutItemCommand for DynamoDB.
    const putCommand = new PutItemCommand({
      TableName: 'usersTable',
      Item: userItem,
    });

    console.log(putCommand);

    // Execute the PutItemCommand using the DynamoDB client.
    await dynamodbClient.send(putCommand);

    return {
      statusCode: 201, // Created
      body: JSON.stringify(userItem),
    };
  } catch (error) {
    console.error('Error creating user:', error);

    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

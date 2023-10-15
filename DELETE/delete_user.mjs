import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const dynamodbClient = new DynamoDBClient({
  region: process.env.IS_OFFLINE ? 'localhost' : undefined, // Adjust region
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined, // Adjust endpoint
});

export const delete_user = async event => {
  const userId = event.pathParameters.id;

  if (!userId) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ message: 'Invalid user ID' }),
    };
  }

  console.log(userId);

  const deleteParams = {
    TableName: 'usersTable',
    Key: {
      pk: { S: userId },
    },
  };

  console.log(deleteParams);

  try {
    const deleteCommand = new DeleteItemCommand(deleteParams);
    await dynamodbClient.send(deleteCommand);

    return {
      statusCode: 200,
      body: JSON.stringify(`User was deleted successfully`),
    };
  } catch (error) {
    console.error('Error retrieving/deleting user:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

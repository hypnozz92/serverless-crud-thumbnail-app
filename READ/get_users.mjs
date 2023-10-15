import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const dynamodbClient = new DynamoDBClient({
  region: process.env.IS_OFFLINE ? 'localhost' : undefined, // Adjust region
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined, // Adjust endpoint
});

export const get_users = async event => {
  const params = {
    TableName: 'usersTable',
  };

  try {
    const command = new ScanCommand(params);
    const data = await dynamodbClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error('Error retrieving users:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

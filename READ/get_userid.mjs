import { DynamoDBClient, BatchGetItemCommand } from '@aws-sdk/client-dynamodb';

const dynamodbClient = new DynamoDBClient({
  region: process.env.IS_OFFLINE ? 'localhost' : undefined, // Adjust region
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined, // Adjust endpoint
});

export const get_userid = async event => {
  const userId = event.pathParameters.id;

  const requestItems = {
    usersTable: {
      Keys: [
        {
          pk: { S: userId },
        },
      ],
    },
  };

  // Create an instance of the BatchGetItemCommand.
  const getCommand = new BatchGetItemCommand({
    RequestItems: requestItems,
  });

  try {
    // Execute the GetCommand using the DynamoDB client.
    const data = await dynamodbClient.send(getCommand);
    // Access the retrieved items from the response.
    const userItems = data.Responses.usersTable;
    console.log(data);

    if (userItems.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(userItems[0]),
    };
  } catch (error) {
    console.error('Error retrieving user:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

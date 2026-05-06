import boto3
import os
import json
import base64

s3 = boto3.client('s3')
db = boto3.resource('dynamodb')
sns = boto3.client('sns')

def lambda_handler(event, context):
    # 1. Define standard headers for the client (Fixes CORS issues)
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",  # Change this to your domain in production
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
    }
    
    try:
        # Retrieve env vars
        bucket_name = os.environ['S3BucketName']
        table_name = os.environ['FileDBName']
        sns_arn = os.environ.get('NotificationTopicARN')
        
        # Get user info safely
        authorizer = event.get('requestContext', {}).get('authorizer', {})
        claims = authorizer.get('claims', {})
        username = claims.get('cognito:username', 'Unknown')
        user_email = claims.get('email', 'Unknown')
        
        # Handle Body (Check if Base64 encoded by API Gateway)
        file_content = event.get('body', '')
        if event.get('isBase64Encoded', False):
            file_content = base64.b64decode(file_content)
        
        file_name = f"upload_{context.aws_request_id}"
        
        # 2. Upload to S3
        s3.put_object(Bucket=bucket_name, Key=file_name, Body=file_content)
        
        # 3. Log to DynamoDB
        table = db.Table(table_name)
        table.put_item(
            Item={
                'fileName': file_name,
                'username': username, 
                'email_address': user_email,
                'file_status': 'Success'
            }
        )
        
        # 4. Send SNS Notification
        if sns_arn:
            message = f"Success! User {user_email} uploaded {file_name}."
            sns.publish(TopicArn=sns_arn, Message=message, Subject="Upload Successful")

        # 5. Return structured Success Response
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'status': 'success',
                'message': 'File processed successfully',
                'data': {
                    'fileName': file_name,
                    'requestId': context.aws_request_id
                }
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        # 6. Return structured Error Response
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'status': 'error',
                'message': 'Internal server error during processing',
                'details': str(e) if "AccessDenied" in str(e) else "Check logs for details"
            })
        }
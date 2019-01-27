import json
import urllib
import boto3
import time
import os

# Boto Clients
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')
firehose = boto3.client('firehose')

# Parameters
firehosestream = os.environ['firehose_stream']
archive_bucket = os.environ['s3_archive_bucket']


def lambda_handler(event, context):
    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        # response = s3.get_object(Bucket=bucket, Key=key)
        capturetime = int(time.time())

        print('got new file : ' + bucket + '/' + key)
        faces = rekognition.detect_faces(
            Image={
                'S3Object': {
                    'Bucket': bucket,
                    'Name': key,
                },
            },
            Attributes=["ALL", "DEFAULT"],
        )

        # Archive the image
        copy_source = {
            'Bucket': bucket,
            'Key': key
        }
        s3.copy(copy_source, archive_bucket, key)
        s3.delete_object(Bucket=bucket, Key=key)

        print('faces detected : ' + str(len(faces['FaceDetails'])))
        id = 0
        for face in faces['FaceDetails']:
            score = 0
            best_emotion = ''

            for emotion in face['Emotions']:
                if emotion['Confidence'] > score:
                    score = emotion['Confidence']
                    best_emotion = emotion['Type']

            payload = {
                'faceid': id,
                'retailTimestamp': capturetime,
                'emotion': best_emotion,
                'emotionConfidence': int(score),
                'smile': face['Smile']['Value'],
                'smileConfidence': face['Smile']['Confidence'],
                'gender': face['Gender']['Value'],
                'genderConfidence': face['Gender']['Confidence'],
                'ageRangeMin': face['AgeRange']['Low'],
                'ageRangeMax': face['AgeRange']['High'],
                'NumberOfFaces': str(len(faces['FaceDetails']))
            }

            print('firehose --> reko-faces ')
            response = firehose.put_record(
                DeliveryStreamName=firehosestream,
                Record={
                    'Data': json.dumps(payload) + '\n'
                }
            )
            print(response)
            id += 1

    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}.'.format(key, bucket))
        raise e
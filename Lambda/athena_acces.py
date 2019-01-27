import time
import boto3
import json


def lambda_handler(event, context):
    print(event['q'])

    query = event['q']

    client = boto3.client('athena')

    response = client.start_query_execution(
        QueryString=query,
        QueryExecutionContext={
            'Database': '<>'
        },
        ResultConfiguration={
            'OutputLocation': '<>',
        }
    )

    query_execution_id = response['QueryExecutionId']

    while (True):

        query_status = client.get_query_execution(QueryExecutionId=query_execution_id)
        query_execution_status = query_status['QueryExecution']['Status']['State']

        if query_execution_status == 'SUCCEEDED':
            print("STATUS:" + query_execution_status)
            break

        elif query_execution_status == 'FAILED':
            raise Exception("STATUS:" + query_execution_status)

        else:
            print("STATUS:" + query_execution_status)
            time.sleep(3)

    result = client.get_query_results(QueryExecutionId=query_execution_id)

    cols = []
    for c in range(0, len(result['ResultSet']['ResultSetMetadata']['ColumnInfo'])):
        cols.append(result['ResultSet']['ResultSetMetadata']['ColumnInfo'][c]['Name'])
    data = []
    for j in range(1, len(result['ResultSet']['Rows'])):
        data_element = {}
        for i in range(0, len(result['ResultSet']['Rows'][j]['Data'])):
            data_element[cols[i]] = result['ResultSet']['Rows'][j]['Data'][i]['VarCharValue']
        data.append(data_element)
    final = {'data': data}
    print(final)
    return {
        'status': 200,
        'body': json.dumps(final)
    }
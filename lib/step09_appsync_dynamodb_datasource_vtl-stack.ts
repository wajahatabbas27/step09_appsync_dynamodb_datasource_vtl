import { CfnOutput, Duration, Expiration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';

export class Step09AppsyncDynamodbDatasourceVtlStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Api for Vtl
    const api = new appsync.GraphqlApi(this, "vtl_api", {
      name: "VTl_api",
      schema: appsync.Schema.fromAsset('graphql/schema.gql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365))
          }
        },
      },
      xrayEnabled: true
    });

    new CfnOutput(this, "graphqlUrl", {
      value: api.graphqlUrl
    })

    new CfnOutput(this, "ApiKey", {
      value: api.apiKey || ''
    })

    //dynamoDb table
    const dynamoTable = new dynamo.Table(this, "DynamoTable1", {
      tableName: "VTl_dynamo_table",
      partitionKey: {
        name: 'id',
        type: dynamo.AttributeType.STRING
      }
    });

    //creating DynamoDb datasource
    const dynamo_data_Source = api.addDynamoDbDataSource("DynamoDataSource", dynamoTable);


    //createNote
    dynamo_data_Source.createResolver({
      typeName: "Mutation",
      fieldName: "createNote",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
      ## Automatically set the id if it's not passed in.
      $util.qr($context.args.put("id", $util.defaultIfNull($ctx.args.id, $util.autoId())))
      {
        "version":"2018-05-29",
        "operation": "PutItem",
        "key": {
          "id" : $util.dynamodb.toDynamoDBJson($ctx.args.id)
        },
        "attributeValues": $util.dynamodb.toMapValuesJson($context.args)
      }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
      #if($context.error)
        $util.error($context.error.message,$context.error.type)
      #else
        $utils.toJson($context.result)
      #end    
      `)
    })

    //Query notes
    dynamo_data_Source.createResolver({
      typeName: "Query",
      fieldName: "notes",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
      {
        "version" : "2017-02-28",
        "operation" : "Scan"
      }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.error)
          $util.error($context.error.message, $context.error.type)
        #else
          $utils.toJson($context.result.items)
        #end
      `)
    })


    //delete note
    dynamo_data_Source.createResolver({
      typeName: "Mutation",
      fieldName: "deleteNote",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
      {
        "version" : "2018-05-29",
        "operation" : "DeleteItem",
        "key" : {
            "id" : $util.dynamodb.toDynamoDBJson($ctx.args.id)
        }
      }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.error)
          $util.error($context.error.message, $context.error.type)
        #else
          $utils.toJson($context.result)
        #end
      `)
    })

    //update note
    dynamo_data_Source.createResolver({
      typeName: "Mutation",
      fieldName: "updateNote",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
      {
        "version" : "2018-05-29",
        "operation" : "UpdateItem",
        "key" : {
            "id" : $util.dynamodb.toDynamoDBJson($ctx.args.id)
        },
        "update" : {
          "expression" : "SET #title = :t",
          "expressionNames" : {
            "#title" : "title"
          },
          "expressionValues" : {
              ":t" : $util.dynamodb.toDynamoDBJson($ctx.args.title)
          }
        }
      }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.error)
          $util.error($context.error.message, $context.error.type)
        #else
          $utils.toJson($context.result)
        #end
      `)
    })


  }
}

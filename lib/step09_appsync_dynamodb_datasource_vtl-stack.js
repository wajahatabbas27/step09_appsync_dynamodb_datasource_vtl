"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Step09AppsyncDynamodbDatasourceVtlStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// import * as sqs from 'aws-cdk-lib/aws-sqs';
const appsync = require("@aws-cdk/aws-appsync-alpha");
const dynamo = require("aws-cdk-lib/aws-dynamodb");
class Step09AppsyncDynamodbDatasourceVtlStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //Api for Vtl
        const api = new appsync.GraphqlApi(this, "vtl_api", {
            name: "VTl_api",
            schema: appsync.Schema.fromAsset('graphql/schema.gql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                    apiKeyConfig: {
                        expires: aws_cdk_lib_1.Expiration.after(aws_cdk_lib_1.Duration.days(365))
                    }
                },
            },
            xrayEnabled: true
        });
        new aws_cdk_lib_1.CfnOutput(this, "graphqlUrl", {
            value: api.graphqlUrl
        });
        new aws_cdk_lib_1.CfnOutput(this, "ApiKey", {
            value: api.apiKey || ''
        });
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
        });
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
        });
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
        });
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
        });
    }
}
exports.Step09AppsyncDynamodbDatasourceVtlStack = Step09AppsyncDynamodbDatasourceVtlStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcDA5X2FwcHN5bmNfZHluYW1vZGJfZGF0YXNvdXJjZV92dGwtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGVwMDlfYXBwc3luY19keW5hbW9kYl9kYXRhc291cmNlX3Z0bC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBaUY7QUFFakYsOENBQThDO0FBQzlDLHNEQUFzRDtBQUN0RCxtREFBbUQ7QUFFbkQsTUFBYSx1Q0FBd0MsU0FBUSxtQkFBSztJQUNoRSxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQzFELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLGFBQWE7UUFDYixNQUFNLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUNsRCxJQUFJLEVBQUUsU0FBUztZQUNmLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztZQUN0RCxtQkFBbUIsRUFBRTtnQkFDbkIsb0JBQW9CLEVBQUU7b0JBQ3BCLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPO29CQUNwRCxZQUFZLEVBQUU7d0JBQ1osT0FBTyxFQUFFLHdCQUFVLENBQUMsS0FBSyxDQUFDLHNCQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUM5QztpQkFDRjthQUNGO1lBQ0QsV0FBVyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVO1NBQ3RCLENBQUMsQ0FBQTtRQUVGLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQzVCLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxJQUFJLEVBQUU7U0FDeEIsQ0FBQyxDQUFBO1FBRUYsZ0JBQWdCO1FBQ2hCLE1BQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3pELFNBQVMsRUFBRSxrQkFBa0I7WUFDN0IsWUFBWSxFQUFFO2dCQUNaLElBQUksRUFBRSxJQUFJO2dCQUNWLElBQUksRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU07YUFDbEM7U0FDRixDQUFDLENBQUM7UUFFSCw4QkFBOEI7UUFDOUIsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFHdEYsWUFBWTtRQUNaLGtCQUFrQixDQUFDLGNBQWMsQ0FBQztZQUNoQyxRQUFRLEVBQUUsVUFBVTtZQUNwQixTQUFTLEVBQUUsWUFBWTtZQUN2QixzQkFBc0IsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7T0FXMUQsQ0FBQztZQUNGLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDOzs7Ozs7T0FNM0QsQ0FBQztTQUNILENBQUMsQ0FBQTtRQUVGLGFBQWE7UUFDYixrQkFBa0IsQ0FBQyxjQUFjLENBQUM7WUFDaEMsUUFBUSxFQUFFLE9BQU87WUFDakIsU0FBUyxFQUFFLE9BQU87WUFDbEIsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7Ozs7O09BSzFELENBQUM7WUFDRix1QkFBdUIsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQzs7Ozs7O09BTTNELENBQUM7U0FDSCxDQUFDLENBQUE7UUFHRixhQUFhO1FBQ2Isa0JBQWtCLENBQUMsY0FBYyxDQUFDO1lBQ2hDLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDOzs7Ozs7OztPQVExRCxDQUFDO1lBQ0YsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7Ozs7OztPQU0zRCxDQUFDO1NBQ0gsQ0FBQyxDQUFBO1FBRUYsYUFBYTtRQUNiLGtCQUFrQixDQUFDLGNBQWMsQ0FBQztZQUNoQyxRQUFRLEVBQUUsVUFBVTtZQUNwQixTQUFTLEVBQUUsWUFBWTtZQUN2QixzQkFBc0IsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FpQjFELENBQUM7WUFDRix1QkFBdUIsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQzs7Ozs7O09BTTNELENBQUM7U0FDSCxDQUFDLENBQUE7SUFHSixDQUFDO0NBQ0Y7QUE1SUQsMEZBNElDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2ZuT3V0cHV0LCBEdXJhdGlvbiwgRXhwaXJhdGlvbiwgU3RhY2ssIFN0YWNrUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbi8vIGltcG9ydCAqIGFzIHNxcyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3FzJztcbmltcG9ydCAqIGFzIGFwcHN5bmMgZnJvbSAnQGF3cy1jZGsvYXdzLWFwcHN5bmMtYWxwaGEnO1xuaW1wb3J0ICogYXMgZHluYW1vIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5cbmV4cG9ydCBjbGFzcyBTdGVwMDlBcHBzeW5jRHluYW1vZGJEYXRhc291cmNlVnRsU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy9BcGkgZm9yIFZ0bFxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcHBzeW5jLkdyYXBocWxBcGkodGhpcywgXCJ2dGxfYXBpXCIsIHtcbiAgICAgIG5hbWU6IFwiVlRsX2FwaVwiLFxuICAgICAgc2NoZW1hOiBhcHBzeW5jLlNjaGVtYS5mcm9tQXNzZXQoJ2dyYXBocWwvc2NoZW1hLmdxbCcpLFxuICAgICAgYXV0aG9yaXphdGlvbkNvbmZpZzoge1xuICAgICAgICBkZWZhdWx0QXV0aG9yaXphdGlvbjoge1xuICAgICAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBhcHBzeW5jLkF1dGhvcml6YXRpb25UeXBlLkFQSV9LRVksXG4gICAgICAgICAgYXBpS2V5Q29uZmlnOiB7XG4gICAgICAgICAgICBleHBpcmVzOiBFeHBpcmF0aW9uLmFmdGVyKER1cmF0aW9uLmRheXMoMzY1KSlcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgeHJheUVuYWJsZWQ6IHRydWVcbiAgICB9KTtcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgXCJncmFwaHFsVXJsXCIsIHtcbiAgICAgIHZhbHVlOiBhcGkuZ3JhcGhxbFVybFxuICAgIH0pXG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsIFwiQXBpS2V5XCIsIHtcbiAgICAgIHZhbHVlOiBhcGkuYXBpS2V5IHx8ICcnXG4gICAgfSlcblxuICAgIC8vZHluYW1vRGIgdGFibGVcbiAgICBjb25zdCBkeW5hbW9UYWJsZSA9IG5ldyBkeW5hbW8uVGFibGUodGhpcywgXCJEeW5hbW9UYWJsZTFcIiwge1xuICAgICAgdGFibGVOYW1lOiBcIlZUbF9keW5hbW9fdGFibGVcIixcbiAgICAgIHBhcnRpdGlvbktleToge1xuICAgICAgICBuYW1lOiAnaWQnLFxuICAgICAgICB0eXBlOiBkeW5hbW8uQXR0cmlidXRlVHlwZS5TVFJJTkdcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vY3JlYXRpbmcgRHluYW1vRGIgZGF0YXNvdXJjZVxuICAgIGNvbnN0IGR5bmFtb19kYXRhX1NvdXJjZSA9IGFwaS5hZGREeW5hbW9EYkRhdGFTb3VyY2UoXCJEeW5hbW9EYXRhU291cmNlXCIsIGR5bmFtb1RhYmxlKTtcblxuXG4gICAgLy9jcmVhdGVOb3RlXG4gICAgZHluYW1vX2RhdGFfU291cmNlLmNyZWF0ZVJlc29sdmVyKHtcbiAgICAgIHR5cGVOYW1lOiBcIk11dGF0aW9uXCIsXG4gICAgICBmaWVsZE5hbWU6IFwiY3JlYXRlTm90ZVwiLFxuICAgICAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogYXBwc3luYy5NYXBwaW5nVGVtcGxhdGUuZnJvbVN0cmluZyhgXG4gICAgICAjIyBBdXRvbWF0aWNhbGx5IHNldCB0aGUgaWQgaWYgaXQncyBub3QgcGFzc2VkIGluLlxuICAgICAgJHV0aWwucXIoJGNvbnRleHQuYXJncy5wdXQoXCJpZFwiLCAkdXRpbC5kZWZhdWx0SWZOdWxsKCRjdHguYXJncy5pZCwgJHV0aWwuYXV0b0lkKCkpKSlcbiAgICAgIHtcbiAgICAgICAgXCJ2ZXJzaW9uXCI6XCIyMDE4LTA1LTI5XCIsXG4gICAgICAgIFwib3BlcmF0aW9uXCI6IFwiUHV0SXRlbVwiLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJpZFwiIDogJHV0aWwuZHluYW1vZGIudG9EeW5hbW9EQkpzb24oJGN0eC5hcmdzLmlkKVxuICAgICAgICB9LFxuICAgICAgICBcImF0dHJpYnV0ZVZhbHVlc1wiOiAkdXRpbC5keW5hbW9kYi50b01hcFZhbHVlc0pzb24oJGNvbnRleHQuYXJncylcbiAgICAgIH1cbiAgICAgIGApLFxuICAgICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6IGFwcHN5bmMuTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAgI2lmKCRjb250ZXh0LmVycm9yKVxuICAgICAgICAkdXRpbC5lcnJvcigkY29udGV4dC5lcnJvci5tZXNzYWdlLCRjb250ZXh0LmVycm9yLnR5cGUpXG4gICAgICAjZWxzZVxuICAgICAgICAkdXRpbHMudG9Kc29uKCRjb250ZXh0LnJlc3VsdClcbiAgICAgICNlbmQgICAgXG4gICAgICBgKVxuICAgIH0pXG5cbiAgICAvL1F1ZXJ5IG5vdGVzXG4gICAgZHluYW1vX2RhdGFfU291cmNlLmNyZWF0ZVJlc29sdmVyKHtcbiAgICAgIHR5cGVOYW1lOiBcIlF1ZXJ5XCIsXG4gICAgICBmaWVsZE5hbWU6IFwibm90ZXNcIixcbiAgICAgIHJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6IGFwcHN5bmMuTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAge1xuICAgICAgICBcInZlcnNpb25cIiA6IFwiMjAxNy0wMi0yOFwiLFxuICAgICAgICBcIm9wZXJhdGlvblwiIDogXCJTY2FuXCJcbiAgICAgIH1cbiAgICAgIGApLFxuICAgICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6IGFwcHN5bmMuTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAgICAjaWYoICRjb250ZXh0LmVycm9yKVxuICAgICAgICAgICR1dGlsLmVycm9yKCRjb250ZXh0LmVycm9yLm1lc3NhZ2UsICRjb250ZXh0LmVycm9yLnR5cGUpXG4gICAgICAgICNlbHNlXG4gICAgICAgICAgJHV0aWxzLnRvSnNvbigkY29udGV4dC5yZXN1bHQuaXRlbXMpXG4gICAgICAgICNlbmRcbiAgICAgIGApXG4gICAgfSlcblxuXG4gICAgLy9kZWxldGUgbm90ZVxuICAgIGR5bmFtb19kYXRhX1NvdXJjZS5jcmVhdGVSZXNvbHZlcih7XG4gICAgICB0eXBlTmFtZTogXCJNdXRhdGlvblwiLFxuICAgICAgZmllbGROYW1lOiBcImRlbGV0ZU5vdGVcIixcbiAgICAgIHJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6IGFwcHN5bmMuTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAge1xuICAgICAgICBcInZlcnNpb25cIiA6IFwiMjAxOC0wNS0yOVwiLFxuICAgICAgICBcIm9wZXJhdGlvblwiIDogXCJEZWxldGVJdGVtXCIsXG4gICAgICAgIFwia2V5XCIgOiB7XG4gICAgICAgICAgICBcImlkXCIgOiAkdXRpbC5keW5hbW9kYi50b0R5bmFtb0RCSnNvbigkY3R4LmFyZ3MuaWQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGApLFxuICAgICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6IGFwcHN5bmMuTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAgICAjaWYoICRjb250ZXh0LmVycm9yKVxuICAgICAgICAgICR1dGlsLmVycm9yKCRjb250ZXh0LmVycm9yLm1lc3NhZ2UsICRjb250ZXh0LmVycm9yLnR5cGUpXG4gICAgICAgICNlbHNlXG4gICAgICAgICAgJHV0aWxzLnRvSnNvbigkY29udGV4dC5yZXN1bHQpXG4gICAgICAgICNlbmRcbiAgICAgIGApXG4gICAgfSlcblxuICAgIC8vdXBkYXRlIG5vdGVcbiAgICBkeW5hbW9fZGF0YV9Tb3VyY2UuY3JlYXRlUmVzb2x2ZXIoe1xuICAgICAgdHlwZU5hbWU6IFwiTXV0YXRpb25cIixcbiAgICAgIGZpZWxkTmFtZTogXCJ1cGRhdGVOb3RlXCIsXG4gICAgICByZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiBhcHBzeW5jLk1hcHBpbmdUZW1wbGF0ZS5mcm9tU3RyaW5nKGBcbiAgICAgIHtcbiAgICAgICAgXCJ2ZXJzaW9uXCIgOiBcIjIwMTgtMDUtMjlcIixcbiAgICAgICAgXCJvcGVyYXRpb25cIiA6IFwiVXBkYXRlSXRlbVwiLFxuICAgICAgICBcImtleVwiIDoge1xuICAgICAgICAgICAgXCJpZFwiIDogJHV0aWwuZHluYW1vZGIudG9EeW5hbW9EQkpzb24oJGN0eC5hcmdzLmlkKVxuICAgICAgICB9LFxuICAgICAgICBcInVwZGF0ZVwiIDoge1xuICAgICAgICAgIFwiZXhwcmVzc2lvblwiIDogXCJTRVQgI3RpdGxlID0gOnRcIixcbiAgICAgICAgICBcImV4cHJlc3Npb25OYW1lc1wiIDoge1xuICAgICAgICAgICAgXCIjdGl0bGVcIiA6IFwidGl0bGVcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJleHByZXNzaW9uVmFsdWVzXCIgOiB7XG4gICAgICAgICAgICAgIFwiOnRcIiA6ICR1dGlsLmR5bmFtb2RiLnRvRHluYW1vREJKc29uKCRjdHguYXJncy50aXRsZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGApLFxuICAgICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6IGFwcHN5bmMuTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAgICAjaWYoICRjb250ZXh0LmVycm9yKVxuICAgICAgICAgICR1dGlsLmVycm9yKCRjb250ZXh0LmVycm9yLm1lc3NhZ2UsICRjb250ZXh0LmVycm9yLnR5cGUpXG4gICAgICAgICNlbHNlXG4gICAgICAgICAgJHV0aWxzLnRvSnNvbigkY29udGV4dC5yZXN1bHQpXG4gICAgICAgICNlbmRcbiAgICAgIGApXG4gICAgfSlcblxuXG4gIH1cbn1cbiJdfQ==
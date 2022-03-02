# VTL -- Velocity Template Language

Its a language
In vtl we are basically performing some work before returning it back , so we have to learn this String language
Its Velocity Template Language , in which we can also perform the tasks like looping,etc.
The basic idea for the VTL is that, it acts like a bridge in between the client and the server so the vtl acts as a bridge to connect and handle things, so as it is created.
appsync by using vtl answers the queries without using the lambda function thats the main idea
It has many util functions which we will use

## VTL -- DynamoDb Features

what ever the data , we are sending from the client will be there inside the - $context.arguments.----data----- e.g : author,title
And to store that data in the DynamoDb we need to convert it -- $util.dynamodb.toDynamoDBJson --- in order to save inside the dynamodb - this is the format

In Response-Mapping-Template -- $util.toJson($context.result)
Here it shows the result in response -mapping-template and its coming from context.result && same as context.arguments -- both the things are coming from the same place -- context

Here in VTL - we can manipulate our data according to our need , we can apply loops and we can do new things like concatenation ,
but its the syntax of the vtl its really sensitive
and its really difficult to debug it for now ,
but it has benefitted alot in such a manner that it acts as a bridge in between the sources like between the client and the server , many operations can be done from this vtl , so we cannot need lambda functon anymore as its making our job easier amd we are also reducing in terms of the cost.

We are Integrating AppSync with DynamoDb as a DataSource

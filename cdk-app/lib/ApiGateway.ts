import { RemovalPolicy } from "aws-cdk-lib";
import { AuthorizationType, CognitoUserPoolsAuthorizer, LambdaIntegration, LogGroupLogDestination, RestApi, Cors } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { Cognito } from "./Cognito";

export class ApiGateway extends RestApi {
    private _authorizer: CognitoUserPoolsAuthorizer;
    constructor(scope: Construct) {
        super(scope, "ApiGateway", {
            restApiName: 'upload_api-gateway',
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(new LogGroup(scope, "ApiLogGroup", {
                    logGroupName: "upload_api-gateway_log-group",
                    retention: RetentionDays.ONE_DAY,
                    removalPolicy: RemovalPolicy.DESTROY
                }))
            },
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS
              }
        });

        const auth = new Cognito(scope);
        this._authorizer = auth.authorizer;

    }

    addIntegration(method: string, path: string, lambda: IFunction) {
        const resource = this.root.resourceForPath(path);
        resource.addMethod(method, new LambdaIntegration(lambda), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this._authorizer,
        })
    }
}
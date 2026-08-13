import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { ACCOUNT_COMPONENT_TYPE } from "../../constants";

export interface AccountArgs {
    /**
     * The service account ID (the username part of the email, e.g. "my-service-account").
     */
    accountId: pulumi.Input<string>;

    /**
     * The display name for the service account.
     */
    displayName: pulumi.Input<string>;

    /**
     * Optional description of the service account's purpose.
     */
    description?: pulumi.Input<string>;

    /**
     * Project ID where the service account will be created.
     */
    project?: pulumi.Input<string>;
}

/**
 * Account Component Resource
 * Provisions a reusable, parameterized Google Cloud Service Account under the agentic-api domain.
 */
export class Account extends pulumi.ComponentResource {
    public readonly account: gcp.serviceaccount.Account;

    constructor(name: string, args: AccountArgs, opts?: pulumi.ComponentResourceOptions) {
        super(ACCOUNT_COMPONENT_TYPE, name, args, opts);

        this.account = new gcp.serviceaccount.Account(name, {
            accountId: args.accountId,
            displayName: args.displayName,
            description: args.description,
            project: args.project,
        }, { parent: this });

        this.registerOutputs({
            account: this.account,
        });
    }
}

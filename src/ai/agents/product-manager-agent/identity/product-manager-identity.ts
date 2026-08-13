import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { Account as ServiceAccount } from "../../../../constructs/serviceaccount/account";
import {
    PRODUCT_MANAGER_IDENTITY_TYPE,
    PRODUCT_MANAGER_IDENTITY_RESOURCE_SUFFIX,
    PRODUCT_MANAGER_OWNER_ROLE_RESOURCE_SUFFIX,
    PRODUCT_MANAGER_IMPERSONATOR_RESOURCE_SUFFIX,
    TOKEN_CREATOR_ROLE,
    OWNER_ROLE,
} from "../../../../constants";

export interface ProductManagerIdentityArgs {
    /**
     * The Google Cloud project ID.
     */
    projectId: pulumi.Input<string>;

    /**
     * The service account ID username.
     */
    accountId: pulumi.Input<string>;

    /**
     * The display name of the service account.
     */
    displayName: pulumi.Input<string>;

    /**
     * The email of the cross-project GitOps Cloud Build service account.
     */
    gitopsCloudbuildSa: pulumi.Input<string>;

    /**
     * The GCP IAM role to bind to the project. Defaults to "roles/owner".
     */
    role?: pulumi.Input<string>;
}

interface ProductManagerIdentityOutputs {
    serviceAccount: ServiceAccount;
    serviceAccountEmail: pulumi.Output<string>;
    iamMember: gcp.projects.IAMMember;
    serviceAccountImpersonator: gcp.serviceaccount.IAMMember;
}

/**
 * ProductManagerIdentity
 * ComponentResource for creating the Product Manager Agent service account with permissions to run the container image
 * and allowing the GitOps Cloud Build service account to impersonate it.
 */
export class ProductManagerIdentity extends pulumi.ComponentResource {
    public readonly serviceAccount: ServiceAccount;
    public readonly serviceAccountEmail: pulumi.Output<string>;
    public readonly iamMember: gcp.projects.IAMMember;
    public readonly serviceAccountImpersonator: gcp.serviceaccount.IAMMember;
    private readonly parentName: string;
    private readonly parentArgs: ProductManagerIdentityArgs;

    constructor(name: string, args: ProductManagerIdentityArgs, opts?: pulumi.ComponentResourceOptions) {
        super(PRODUCT_MANAGER_IDENTITY_TYPE, name, args, opts);
        this.parentName = name;
        this.parentArgs = args;

        this.serviceAccount = this.constructServiceAccount();
        this.serviceAccountEmail = this.serviceAccount.account.email;
        this.iamMember = this.constructIamMember();
        this.serviceAccountImpersonator = this.constructServiceAccountImpersonator();

        const parentOutputs = this.constructParentOutputs();
        this.registerOutputs(parentOutputs);
    }

    private constructServiceAccount(): ServiceAccount {
        const saResourceName = this.constructServiceAccountResourceName();
        return new ServiceAccount(
            saResourceName,
            {
                accountId: this.parentArgs.accountId,
                displayName: this.parentArgs.displayName,
                project: this.parentArgs.projectId,
            },
            { parent: this }
        );
    }

    private constructIamMember(): gcp.projects.IAMMember {
        const iamResourceName = this.constructIamMemberResourceName();
        return new gcp.projects.IAMMember(
            iamResourceName,
            {
                project: this.parentArgs.projectId,
                role: this.parentArgs.role ?? OWNER_ROLE,
                member: this.constructServiceAccountOwnerRoleMemberIdentity(),
            },
            { parent: this }
        );
    }

    private constructServiceAccountImpersonator(): gcp.serviceaccount.IAMMember {
        const impersonatorResourceName = this.constructServiceAccountImpersonatorResourceName();
        return new gcp.serviceaccount.IAMMember(
            impersonatorResourceName,
            {
                serviceAccountId: this.serviceAccount.account.name,
                role: TOKEN_CREATOR_ROLE,
                member: this.constructServiceAccountImpersonatorIdentity(),
            },
            { parent: this }
        );
    }

    private constructParentOutputs(): ProductManagerIdentityOutputs {
        return {
            serviceAccount: this.serviceAccount,
            serviceAccountEmail: this.serviceAccountEmail,
            iamMember: this.iamMember,
            serviceAccountImpersonator: this.serviceAccountImpersonator,
        };
    }

    private constructServiceAccountResourceName(): string {
        return this.constructChildResourceName(PRODUCT_MANAGER_IDENTITY_RESOURCE_SUFFIX);
    }

    private constructIamMemberResourceName(): string {
        return this.constructChildResourceName(PRODUCT_MANAGER_OWNER_ROLE_RESOURCE_SUFFIX);
    }

    private constructServiceAccountImpersonatorResourceName(): string {
        return this.constructChildResourceName(PRODUCT_MANAGER_IMPERSONATOR_RESOURCE_SUFFIX);
    }

    private constructServiceAccountOwnerRoleMemberIdentity(): pulumi.Input<string> {
        return this.constructServiceAccountMemberIdentity(this.serviceAccountEmail);
    }

    private constructServiceAccountImpersonatorIdentity(): pulumi.Input<string> {
        return this.constructServiceAccountMemberIdentity(this.parentArgs.gitopsCloudbuildSa);
    }

    private constructChildResourceName(resourceName: string): string {
        return `${this.parentName}-${resourceName}`;
    }

    private constructServiceAccountMemberIdentity(serviceAccountEmail: pulumi.Input<string>): pulumi.Input<string> {
        return pulumi.interpolate`serviceAccount:${serviceAccountEmail}`;
    }
}

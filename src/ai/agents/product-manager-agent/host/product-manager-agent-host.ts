import * as pulumi from "@pulumi/pulumi";
import { Service as CloudRunv2Service, ServiceArgs as CloudRunv2ServiceArgs } from "../../../../constructs/cloudrunv2/service";
import {
    PRODUCT_MANAGER_AGENT_HOST_TYPE,
    PRODUCT_MANAGER_AGENT_HOST_RESOURCE_SUFFIX,
} from "../../../../constants";

export interface ProductManagerAgentHostArgs {
    /**
     * The Google Cloud project ID.
     */
    projectId: pulumi.Input<string>;

    /**
     * The GCP location/region for the service (e.g. "us-central1").
     */
    location: pulumi.Input<string>;

    /**
     * The container image location.
     */
    image: pulumi.Input<string>;

    /**
     * The service account email to execute the container.
     */
    serviceAccountEmail?: pulumi.Input<string>;

    /**
     * Maximum instance scaling count.
     */
    maxInstanceCount?: pulumi.Input<number>;

    /**
     * Environment variables for the agent container.
     */
    envVars?: Record<string, pulumi.Input<string>>;
}

interface ProductManagerAgentHostOutputs {
    cloudRunService: CloudRunv2Service;
    serviceUri: pulumi.Output<string>;
}

/**
 * ProductManagerAgentHost
 * Self-contained Pulumi ComponentResource for hosting the Product Manager Agent flow server on Google Cloud Run v2.
 */
export class ProductManagerAgentHost extends pulumi.ComponentResource {
    public readonly cloudRunService: CloudRunv2Service;
    public readonly serviceUri: pulumi.Output<string>;
    private readonly parentName: string;
    private readonly parentArgs: ProductManagerAgentHostArgs;
    private readonly parentOutputs: ProductManagerAgentHostOutputs;

    constructor(name: string, args: ProductManagerAgentHostArgs, opts?: pulumi.ComponentResourceOptions) {
        super(PRODUCT_MANAGER_AGENT_HOST_TYPE, name, args, opts);
        this.parentName = name;
        this.parentArgs = args;

        this.cloudRunService = this.createAndRegisterCloudRunService();
        this.serviceUri = this.cloudRunService.uri;

        this.parentOutputs = this.constructParentOutputs();
        this.registerOutputs(this.parentOutputs);
    }

    private constructParentOutputs(): ProductManagerAgentHostOutputs {
        return {
            cloudRunService: this.cloudRunService,
            serviceUri: this.serviceUri,
        };
    }

    private createAndRegisterCloudRunService(): CloudRunv2Service {
        const serviceResourceName = this.constructCloudRunServiceResourceName();
        const serviceArgs = this.constructCloudRunServiceArgs();
        return new CloudRunv2Service(serviceResourceName, serviceArgs, { parent: this });
    }

    private constructCloudRunServiceResourceName(): string {
        return this.constructChildResourceName(PRODUCT_MANAGER_AGENT_HOST_RESOURCE_SUFFIX);
    }

    private constructChildResourceName(resourceName: string): string {
        return `${this.parentName}-${resourceName}`;
    }

    private constructCloudRunServiceArgs(): CloudRunv2ServiceArgs {
        return {
            serviceName: this.constructCloudRunServiceResourceName(),
            location: this.parentArgs.location,
            image: this.parentArgs.image,
            serviceAccount: this.parentArgs.serviceAccountEmail,
            maxInstanceCount: this.parentArgs.maxInstanceCount,
            envs: this.constructEnvironmentVariables(),
        };
    }

    private constructEnvironmentVariables() {
        const envVars = this.parentArgs.envVars ?? {};
        return Object.entries(envVars).map(([name, value]) => ({
            name,
            value,
        }));
    }
}

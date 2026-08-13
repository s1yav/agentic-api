// Repository Domain Namespace
export const AGENTIC_API_DOMAIN = "agentic-api";

// Component Resource Types
export const PRODUCT_MANAGER_AGENT_HOST_TYPE = `${AGENTIC_API_DOMAIN}:ai:ProductManagerAgentHost`;
export const PRODUCT_MANAGER_IDENTITY_TYPE = `${AGENTIC_API_DOMAIN}:ai:ProductManagerIdentity`;
export const ACCOUNT_COMPONENT_TYPE = `${AGENTIC_API_DOMAIN}:constructs:Account`;
export const CLOUDRUNV2_SERVICE_COMPONENT_TYPE = `${AGENTIC_API_DOMAIN}:constructs:CloudRunv2Service`;

// Component Resource Suffixes
export const PRODUCT_MANAGER_AGENT_HOST_RESOURCE_SUFFIX = "pm-agent-host";
export const PRODUCT_MANAGER_IDENTITY_RESOURCE_SUFFIX = "pm-agent-sa";
export const PRODUCT_MANAGER_OWNER_ROLE_RESOURCE_SUFFIX = "pm-agent-owner-role";

// IAM Constants
export const OWNER_ROLE = "roles/owner";
export const DEFAULT_PM_AGENT_SA_DISPLAY_NAME = "Product Manager Agent Service Account";

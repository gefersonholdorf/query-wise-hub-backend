export interface Service<ServiceRequest, ServiceResponse> {
	execute(serviceRequest: ServiceRequest): Promise<ServiceResponse>;
}

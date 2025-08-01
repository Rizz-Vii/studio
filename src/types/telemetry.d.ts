/**
 * Type declarations for OpenTelemetry modules
 */
declare module '@opentelemetry/resources' {
  export class Resource {
    static default(): Resource;
    merge(other: Resource): Resource;
  }
  export const detectResources: any;
}

declare module '@opentelemetry/sdk-logs' {
  export class LoggerProvider {
    addLogRecordProcessor(processor: any): void;
    getLogger(name: string): any;
  }
}

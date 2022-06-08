import * as env from 'env-var';
import './dotenv';

const config = {
    service: {
        port: env.get('PORT').required().asPortNumber(),
        useCors: env.get('USE_CORS').default('false').asBool(),
    },
    minio: {
        endPoint: env.get('MINIO_ENDPOINT').default('localhost').required().asString(),
        port: env.get('MINIO_PORT').default(9000).asPortNumber(),
        accessKey: env.get('MINIO_ROOT_USER').default('minio').required().asString(),
        secretKey: env.get('MINIO_ROOT_PASSWORD').default('minio123').required().asString(),
        useSSL: env.get('MINIO_USE_SSL').default('false').asBool(),
        partSize: env
            .get('MINIO_PART_SIZE')
            .default(10 * 1024 * 1024)
            .asInt(),
    },
};

export default config;

import * as env from 'env-var';
import './dotenv';

const config = {
    service: {
        port: env.get('PORT').required().asPortNumber(),
        useCors: env.get('USE_CORS').default('false').asBool(),
    },
    minio: {
        endpoint: env.get('MINIO_ENDPOINT').default('localhost').required().asString(),
        port: env.get('MINIO_PORT').default(9000).asPortNumber(),
        accessKey: env.get('MINIO_ACCESS_KEY').default('minio').required().asString(),
        secretKey: env.get('MINIO_SECRET_KEY').default('minio123').required().asString(),
        useSSL: env.get('MINIO_USE_SSL').default('false').asBool(),
        partSize: env
            .get('MINIO_PART_SIZE')
            .default(10 * 1024 * 1024)
            .asInt(),
    },
};

export default config;

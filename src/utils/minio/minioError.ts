import { StatusCodes } from 'http-status-codes';
import { ServerError } from '../../express/error';

// todo: when the newKey already exists in the bucket, error code is InvalidRequest (does not have a case)
const handleMinioErrorsCode = (err: any, errCode: string) => {
    switch (errCode) {
        case 'NoSuchKey':
            throw new ServerError(StatusCodes.NOT_FOUND, 'The specified file does not exist.', err);
        case 'NoSuchBucket':
            throw new ServerError(StatusCodes.NOT_FOUND, 'The specified bucket does not exist.', err);
        default:
            throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to copy object: ${err.message}`, err);
    }
};

export default handleMinioErrorsCode;

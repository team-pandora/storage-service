import { StatusCodes } from 'http-status-codes';
import { ServerError } from '../../express/error';

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

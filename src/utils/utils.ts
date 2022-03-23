import { ObjectId } from 'mongodb';

const reverseString = (str: string): string => {
    return str ? str.split('').reverse().join('') : '';
};

function generateKey() {
    const objectID: ObjectId = new ObjectId();
    return reverseString(objectID.toHexString());
}

export default { generateKey };

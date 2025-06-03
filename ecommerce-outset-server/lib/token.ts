import crypto from 'crypto';

export async function generateToken(length: number = 32): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(buffer.toString('hex'));
    });
  });
}

export async function hashToken(token: string): Promise<string> {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
} 
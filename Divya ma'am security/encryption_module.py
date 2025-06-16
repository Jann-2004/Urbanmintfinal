from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os
import base64

def generate_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return kdf.derive(password.encode())

def encrypt_message(message: str, password: str) -> dict:
    salt = os.urandom(16)
    iv = os.urandom(16)
    key = generate_key(password, salt)
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    encrypted = encryptor.update(message.encode()) + encryptor.finalize()
    return {
        "ciphertext": base64.b64encode(encrypted).decode(),
        "salt": base64.b64encode(salt).decode(),
        "iv": base64.b64encode(iv).decode()
    }

def decrypt_message(ciphertext, password, salt, iv):
    """Decrypts the message with AES encryption."""
    
    # Deriving key from password and salt using PBKDF2
    key = generate_key(password, base64.b64decode(salt))

    # Create cipher config
    cipher = Cipher(algorithms.AES(key), modes.CFB(base64.b64decode(iv)), backend=default_backend())

    # Decrypt and return the plaintext
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(base64.b64decode(ciphertext)) + decryptor.finalize()

    decrypted_message = decrypted_data.decode('utf-8')
    return decrypted_message
